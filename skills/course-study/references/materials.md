# Shared course context and materials

Start with the supplied Obsidian folder and its course overview. Identify course numbers, Canvas ids, local materials, and submission portals without guessing. Preserve existing files and user edits.

**Readiness comes before collection.** Inventory existing lecture notes, readings, homework, previous textbooks, and requested scope. Textbook generation normally uses these local inputs. Missing an essential textbook input means asking for that particular file or scope, not automatically sweeping Canvas or other courses. If asked for the newest lecture and local files cannot establish it, ask whether the supplied scope is complete or use collection only when requested.

**When collection is requested:** use the bundled Canvas MCP and professor sites for the selected courses/materials. Todo requests require live deadline verification under `todo.md`; textbook requests alone do not authorize deadline sweeps or new todo batches. Save verified materials in `资料` before downstream authoring. Report missing sources honestly.

## Auth playbook

The bundled `canvas` MCP authenticates with the user's own browser session cookies (`set_cookie(domain?, cookie)`, stored under `~/.canvas-mcp/cookies/`, mode 600, read-only access). Non-Duke schools: set `CANVAS_HOST`.

- **Use stored cookies first**, unless the user explicitly asks to supply a cookie. Otherwise ask only after an authentication error reports a missing/expired cookie. When needed, give this guidance:
  > Open the page in Chrome and log in → press F12 → go to the **Network tab** (not "view source") → refresh → click the top request of type *document* → under **Request Headers**, copy the entire `cookie:` line's value → paste it back to me.
  Then `set_cookie(domain, cookie)` and resume where you stopped.
- Expiry expectations: Canvas cookies last days; Shibboleth/SSO cookies on professor sites last hours. A mid-collection SSO bounce means re-ask, not retry.
- A cookie is a credential: it goes into `set_cookie` and nowhere else — no file you produce, no chat echo, no logs.

Known LMS terrain (saves an hour of 401s):
- Courses often close the **Files** tab to students → walk **Modules** or **Assignments**; a module file item's API URL must be GET'd once more for the real download `.url`.
- Professor sites carry the real content more often than Canvas. Google Docs export via `…/export?format=pdf`.
- Recordings (Panopto/Zoom) sit behind LTI — unreachable; they stay hyperlinks.

## 资料 — the materials store

**Download everything reachable within the requested collection scope — Canvas AND professor-site files.** A link is only acceptable where a download is impossible: SSO walls you lack a cookie for, videos, submission portals.

- Naming: `<course>_<Category><NN?>_<Name?>.<ext>`. Categories: HW, Assign, Slides, SlidesAll, Notes, Setup, Lab, Syllabus, PracticeMidterm, FinalProject. Examples: `270_HW1.pdf`, `350_Slides01_Intro.pdf`, `270_Notes_TransmissionLines.pdf`, `371_Assign0_notebook.ipynb`, `350_SlidesAll_Spring2024.pdf`.
- **Quarantine rule**: download to a temp dir → verify (MIME matches, PDF tail has `%%EOF`, size matches Content-Length — MCP `download` enforces length) → only then copy into 资料. Never redownload over a good file unverified: a truncated PDF opens blank, and a login page saved as `.pdf` is worse.
