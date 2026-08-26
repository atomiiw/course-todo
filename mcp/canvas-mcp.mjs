#!/usr/bin/env node
// Zero-dependency authenticated-fetch + Canvas LMS MCP server (stdio JSON-RPC).
// Auth = your browser session cookies, stored PER DOMAIN under ~/.canvas-mcp/cookies/<host>.
// Read-only. Legacy canvas cookie at ~/.canvas-mcp/cookie still works.
import https from "node:https";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import readline from "node:readline";

const DIR = join(homedir(), ".canvas-mcp");
const COOKIE_DIR = join(DIR, "cookies");
const LEGACY_CANVAS_COOKIE = join(DIR, "cookie");
mkdirSync(COOKIE_DIR, { recursive: true });

const CANVAS_HOST = process.env.CANVAS_HOST || "canvas.duke.edu"; // your school's Canvas host
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";
const hostOf = (s) => s.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

function cookieFor(host) {
  try { return readFileSync(join(COOKIE_DIR, host), "utf8").trim(); } catch {}
  if (host === CANVAS_HOST) { try { return readFileSync(LEGACY_CANVAS_COOKIE, "utf8").trim(); } catch {} }
  return "";
}

// A redirect to an SSO/login endpoint means we're not authenticated for that host.
const isAuthRedirect = (loc) => /shib|\/idp\/|saml|\/login|\/sso|adfs|Shibboleth|oauth\/authorize|accounts\.google/i.test(loc || "");

// GET with per-domain cookie + browser UA. Follows normal redirects (e.g. Canvas -> signed
// user-content host), but STOPS and reports "cookie expired" if bounced to an SSO login flow.
// No Accept-Encoding sent, so responses are never gzip'd (nothing to decompress).
function httpGet(url, { maxRedirects = 6 } = {}) {
  return new Promise((resolve, reject) => {
    const go = (u, left) => {
      let host;
      try { host = new URL(u).host; } catch { return reject(new Error(`Bad URL: ${u}`)); }
      const cookie = cookieFor(host);
      const headers = { "User-Agent": UA, Accept: "*/*" };
      if (cookie) headers.Cookie = cookie;
      https.get(u, { headers }, (res) => {
        const st = res.statusCode;
        if (st >= 300 && st < 400 && res.headers.location) {
          const loc = new URL(res.headers.location, u).toString();
          res.resume();
          if (isAuthRedirect(loc)) return reject(new Error(`Auth redirect to SSO (${hostOf(loc)}) — cookie for ${host} missing/expired. Run set_cookie(domain:"${host}", ...).`));
          if (left <= 0) return reject(new Error("Too many redirects"));
          return go(loc, left - 1);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: st, headers: res.headers, body: Buffer.concat(chunks), finalUrl: u }));
      }).on("error", reject);
    };
    go(url, maxRedirects);
  });
}

// Canvas REST GET with Link-header pagination -> array of JSON.
async function apiGet(path) {
  if (!cookieFor(CANVAS_HOST)) throw new Error(`No cookie for ${CANVAS_HOST}. Run set_cookie first.`);
  let url = path.startsWith("http") ? path : `https://${CANVAS_HOST}/api/v1${path.startsWith("/") ? "" : "/"}${path}`;
  const out = [];
  while (url) {
    const r = await httpGet(url);
    if (r.status === 401 || r.status === 403) throw new Error(`Auth failed (HTTP ${r.status}) — cookie likely expired. Re-run set_cookie.`);
    if (r.status >= 400) throw new Error(`HTTP ${r.status}: ${r.body.toString().slice(0, 300)}`);
    let data;
    try { data = JSON.parse(r.body.toString().replace(/^while\(1\);/, "")); }
    catch { throw new Error(`Non-JSON response (logged out?): ${r.body.toString().slice(0, 200)}`); }
    if (Array.isArray(data)) out.push(...data); else out.push(data);
    url = null;
    for (const part of (r.headers.link || "").split(","))
      if (part.includes('rel="next"')) url = part.split(";")[0].trim().replace(/^<|>$/g, "");
  }
  return out;
}

const j = (x) => JSON.stringify(x, null, 2);

const TOOLS = {
  // ---- generic auth-fetch ----
  set_cookie: {
    desc: "Save a browser session cookie for a domain (default: your Canvas host). Paste the full Cookie: request header from DevTools Network. Re-run when it expires.",
    schema: { type: "object", properties: { domain: { type: "string", description: "Host, e.g. a professor-site domain (default: your Canvas host)" }, cookie: { type: "string", description: "Full Cookie header value" } }, required: ["cookie"] },
    run: async ({ domain, cookie }) => {
      const host = hostOf(domain || CANVAS_HOST);
      writeFileSync(join(COOKIE_DIR, host), cookie.trim(), { mode: 0o600 });
      return `Cookie saved for ${host} (${cookie.trim().length} chars).`;
    },
  },
  which_cookies: {
    desc: "List which domains have a stored cookie.",
    schema: { type: "object", properties: {} },
    run: async () => {
      const { readdirSync } = await import("node:fs");
      const hosts = [];
      try { hosts.push(...readdirSync(COOKIE_DIR)); } catch {}
      if (cookieFor(CANVAS_HOST) && !hosts.includes(CANVAS_HOST)) hosts.push(`${CANVAS_HOST} (legacy)`);
      return hosts.length ? hosts.join("\n") : "(none)";
    },
  },
  download: {
    desc: "Download any URL's bytes to a local file, using the browser UA and the stored cookie for that URL's domain. Follows normal redirects; if bounced to an SSO login it reports cookie expired instead of following. Use for Shibboleth-protected PDFs (people.duke.edu slides), Canvas file download links, etc.",
    schema: { type: "object", properties: { url: { type: "string" }, out_path: { type: "string", description: "Absolute local path to write" } }, required: ["url", "out_path"] },
    run: async ({ url, out_path }) => {
      const r = await httpGet(url);
      if (r.status >= 400) throw new Error(`HTTP ${r.status} for ${url}`);
      // Truncation guard: if the server declared a length, the body must match it exactly.
      const declared = r.headers["content-length"] != null ? Number(r.headers["content-length"]) : null;
      if (declared != null && r.body.length !== declared)
        throw new Error(`Truncated download: got ${r.body.length} of ${declared} bytes (connection dropped mid-stream). File NOT written — retry.`);
      mkdirSync(dirname(out_path), { recursive: true });
      writeFileSync(out_path, r.body);
      const ct = r.headers["content-type"] || "?";
      return `Saved ${r.body.length} bytes (${ct}${declared != null ? ", length-verified" : ""}) -> ${out_path}${r.finalUrl !== url ? `\n(followed to ${r.finalUrl})` : ""}`;
    },
  },
  fetch: {
    desc: "Fetch a URL and return its text/HTML (for listing an Apache directory index, scraping links, etc.). Same per-domain cookie + SSO-detection as download.",
    schema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    run: async ({ url }) => {
      const r = await httpGet(url);
      if (r.status >= 400) throw new Error(`HTTP ${r.status} for ${url}`);
      const t = r.body.toString("utf8");
      return t.length > 400000 ? t.slice(0, 400000) + "\n...[truncated]" : t;
    },
  },
  // ---- Canvas convenience ----
  list_courses: {
    desc: "List the user's active Canvas courses (id + name).",
    schema: { type: "object", properties: {} },
    run: async () => j((await apiGet("/courses?enrollment_state=active&per_page=100")).map((c) => ({ id: c.id, name: c.name, code: c.course_code }))),
  },
  course_tabs: {
    desc: "List a Canvas course's LEFT SIDEBAR incl external tools (Panopto/Zoom recordings). Discovers whatever a prof added.",
    schema: { type: "object", properties: { course_id: { type: "number" } }, required: ["course_id"] },
    run: async ({ course_id }) => j((await apiGet(`/courses/${course_id}/tabs`)).map((t) => ({ label: t.label, type: t.type, url: t.html_url || t.full_url, hidden: !!t.hidden }))),
  },
  list_folders: {
    desc: "List all Files folders in a Canvas course (recursive, file counts).",
    schema: { type: "object", properties: { course_id: { type: "number" } }, required: ["course_id"] },
    run: async ({ course_id }) => j((await apiGet(`/courses/${course_id}/folders?per_page=100`)).map((f) => ({ id: f.id, path: f.full_name, files: f.files_count }))),
  },
  list_files: {
    desc: "List files in one Canvas folder (id from list_folders), with download URLs.",
    schema: { type: "object", properties: { folder_id: { type: "number" } }, required: ["folder_id"] },
    run: async ({ folder_id }) => j((await apiGet(`/folders/${folder_id}/files?per_page=100`)).map((f) => ({ name: f.display_name, url: f.url, type: f.content_type, size: f.size }))),
  },
  list_assignments: {
    desc: "List Canvas assignments in a course with due dates.",
    schema: { type: "object", properties: { course_id: { type: "number" } }, required: ["course_id"] },
    run: async ({ course_id }) => j((await apiGet(`/courses/${course_id}/assignments?per_page=100`)).map((a) => ({ name: a.name, due: a.due_at, points: a.points_possible, url: a.html_url }))),
  },
  announcements: {
    desc: "Recent Canvas announcements in a course.",
    schema: { type: "object", properties: { course_id: { type: "number" } }, required: ["course_id"] },
    run: async ({ course_id }) => j((await apiGet(`/announcements?context_codes[]=course_${course_id}&per_page=50`)).map((a) => ({ title: a.title, posted: a.posted_at, message: (a.message || "").replace(/<[^>]+>/g, " ").trim().slice(0, 500) }))),
  },
  list_pages: {
    desc: "List Canvas wiki pages in a course.",
    schema: { type: "object", properties: { course_id: { type: "number" } }, required: ["course_id"] },
    run: async ({ course_id }) => j((await apiGet(`/courses/${course_id}/pages?per_page=100`)).map((p) => ({ title: p.title, url: p.url, updated: p.updated_at }))),
  },
  get_page: {
    desc: "Get one Canvas page's body text (url slug from list_pages).",
    schema: { type: "object", properties: { course_id: { type: "number" }, page_url: { type: "string" } }, required: ["course_id", "page_url"] },
    run: async ({ course_id, page_url }) => { const p = (await apiGet(`/courses/${course_id}/pages/${page_url}`))[0]; return `# ${p.title}\n\n${(p.body || "").replace(/<[^>]+>/g, " ")}`; },
  },
  api_get: {
    desc: "ESCAPE HATCH: GET any Canvas REST path (e.g. '/courses/123/modules?include[]=items') and return raw JSON. For anything the convenience tools don't cover.",
    schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    run: async ({ path }) => j(await apiGet(path)),
  },
};

// ---- MCP stdio JSON-RPC loop ----
const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
const rl = readline.createInterface({ input: process.stdin });
let protocol = "2025-06-18";

rl.on("line", async (line) => {
  line = line.trim();
  if (!line) return;
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;
  const reply = (result) => send({ jsonrpc: "2.0", id, result });
  const fail = (message) => send({ jsonrpc: "2.0", id, error: { code: -32000, message } });

  if (method === "initialize") {
    protocol = params?.protocolVersion || protocol;
    return reply({ protocolVersion: protocol, capabilities: { tools: {} }, serverInfo: { name: "canvas-mcp", version: "2.0.0" } });
  }
  if (method?.startsWith("notifications/")) return;
  if (method === "tools/list") {
    return reply({ tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.desc, inputSchema: t.schema })) });
  }
  if (method === "tools/call") {
    const t = TOOLS[params?.name];
    if (!t) return fail(`Unknown tool: ${params?.name}`);
    try {
      const text = await t.run(params.arguments || {});
      return reply({ content: [{ type: "text", text: String(text) }] });
    } catch (e) {
      return reply({ content: [{ type: "text", text: `ERROR: ${e.message}` }], isError: true });
    }
  }
  if (id !== undefined) fail(`Unknown method: ${method}`);
});
