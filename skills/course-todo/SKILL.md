---
name: course-todo
description: Turn Canvas + professor course sites into a cumulative, ADHD-friendly todo.md inside an Obsidian folder, with every reachable course file downloaded, verified, and locally linked. Use when the user asks to update their course todo, plan schoolwork through a date, or collect course materials. Inputs: the Obsidian folder and the end date of the range.
---

# Course Todo

You maintain one deliverable for a student who skips lectures: open `todo.md`, and everything needed to survive the next deadline window is one click away — the assignment, the exact material that teaches it, and where to submit. No LMS spelunking, no dead links, no half-downloaded PDFs.

Two artifacts, both inside the user's Obsidian folder:

| Artifact | What it is |
|---|---|
| `todo.md` | Cumulative batches of Study + Submit checkboxes. One batch per request. Old batches are never touched — the user's checkmarks live there. |
| `资料/` | Flat folder of downloaded materials that `todo.md` links to. |

## Definition of done

Ship only when ALL hold — otherwise say what's missing in chat:

1. One new batch section exists in `todo.md`; every other line of the file is byte-identical to before.
2. Every deliverable due in the window appears under Submit with its real deadline, verified against the source (LMS/site), not assumed from a syllabus.
3. Every `[name](资料/…)` link resolves to a file that passed integrity checks.
4. Anything that could not be fetched is reported in chat with the reason — never silently dropped, never written into the file as a caveat.

## Inputs — settle before touching anything

- **Obsidian folder** (absolute path). It must contain a course-overview note (course numbers, LMS course ids, submission-portal links, schedule). That note is the map: read it first, trust it for *where things are submitted*; trust the live LMS for *what is due when*. No overview note → ask the user for one; do not guess course ids.
- **End date** — the new batch covers today through that date.

## The pipeline (in order, no skipping)

1. **Map**: read the overview note. List each course's sources: Canvas course id, professor site, submission portal.
2. **Enumerate**: for each course, pull what's due in the window — `list_assignments`, `api_get("/courses/:id/modules?include[]=items")`, course files, announcements, and `fetch` the professor site. A course with no Canvas assignments usually posts homework as files and collects it elsewhere (Gradescope) — check both.
3. **Collect** (rules under 资料 below): download every file a batch item references.
4. **Write**: append the batch to `todo.md` per the format contract below.
5. **Report** in chat: what was downloaded (sizes/page counts, so a bad file is spottable), what wasn't and why, plus anything that belongs in chat instead of the file (attendance-only events, upcoming cookie expiry).

## Auth playbook

The bundled `canvas` MCP authenticates with the user's own browser session cookies (`set_cookie(domain?, cookie)`, stored under `~/.canvas-mcp/cookies/`, mode 600, read-only access). Non-Duke schools: set `CANVAS_HOST`.

- **Never ask for a cookie preemptively.** Use stored cookies; only when a tool errors "cookie missing/expired for <host>" do you deliver this script, verbatim:
  > Open the page in Chrome and log in → press F12 → go to the **Network tab** (not "view source") → refresh → click the top request of type *document* → under **Request Headers**, copy the entire `cookie:` line's value → paste it back to me.
  Then `set_cookie(domain, cookie)` and resume where you stopped.
- Expiry expectations: Canvas cookies last days; Shibboleth/SSO cookies on professor sites last hours. A mid-collection SSO bounce means re-ask, not retry.
- A cookie is a credential: it goes into `set_cookie` and nowhere else — no file you produce, no chat echo, no logs.

Known LMS terrain (saves an hour of 401s):
- Courses often close the **Files** tab to students → walk **Modules** or **Assignments**; a module file item's API URL must be GET'd once more for the real download `.url`.
- Professor sites carry the real content more often than Canvas. Google Docs export via `…/export?format=pdf`.
- Recordings (Panopto/Zoom) sit behind LTI — unreachable; they stay hyperlinks.

## 资料 — the materials store

**Download everything reachable that the batch references — Canvas AND professor-site files.** A link is only acceptable where a download is impossible: SSO walls you lack a cookie for, videos, submission portals.

- Naming: `<course>_<Category><NN?>_<Name?>.<ext>`. Categories: HW, Assign, Slides, SlidesAll, Notes, Setup, Lab, Syllabus, PracticeMidterm, FinalProject. Examples: `270_HW1.pdf`, `350_Slides01_Intro.pdf`, `270_Notes_TransmissionLines.pdf`, `371_Assign0_notebook.ipynb`, `350_SlidesAll_Spring2024.pdf`.
- **Quarantine rule**: download to a temp dir → verify (MIME matches, PDF tail has `%%EOF`, size matches Content-Length — MCP `download` enforces length) → only then copy into 资料. Never redownload over a good file unverified: a truncated PDF opens blank, and a login page saved as `.pdf` is worse.

## todo.md — the format contract

New batch prepends directly under `# TODO` (newest first). Shape:

```markdown
# TODO

## Before 9/3

### Study
- [ ] 270: read [Transmission Lines notes](资料/270_Notes_TransmissionLines.pdf) p41–48 — this week's assigned reading, Quiz 1 covers it
- [ ] 350: read the week-1 slides [01-intro](资料/350_Slides01_Intro.pdf) — HW1 is entirely on this
- [ ] 371: watch the [Panopto recording](https://canvas.example.edu/courses/123/external_tools/2980) to catch up on lecture 1
- [ ] 662: find teammates in [Slack](https://example.slack.com) — team due 9/9

### Submit
- [ ] 270 HW1 → [Gradescope](https://www.gradescope.com/courses/1335314) 【Fri 8/28, 5pm】
  - [assignment PDF](资料/270_HW1.pdf), 3 problems: complex numbers in polar form, voltage phasor magnitude & phase, plotting wave propagation f(z±ct)
- [ ] 270 Quiz 1, in class 【Fri 8/28】
- [ ] 371 Assign 0 → Gradescope via the [Canvas entry](https://canvas.example.edu/courses/123/external_tools/181) 【Thu 9/3, 11:59 **AM** — noon, not midnight】
  - [assignment](资料/371_Assign0.html) + [notebook template](资料/371_Assign0_notebook.ipynb): set up Python/Jupyter and do a few short prereq self-check problems; submit the notebook + PDF pair
```

Line grammar — deviate from none of these (each rule exists because a user demanded it):

- **Study**: `<course>: <verb> [<material>](资料/file-or-url) — <why it matters, a few words>`. Admit ONLY material that directly serves this batch's assignments/quizzes. No lecture previews, no enrichment, no "worth knowing".
- **Submit**: `<course> <item> → [<portal>](url) 【<Day M/D, time>】` — work first, deadline last, always in 【】. AM deadlines get flagged loudly: `11:59 **AM** — noon, not midnight`.
- One indented sub-bullet per real assignment: local link + one-line breakdown (problems, points, topics) — enough to size the work without opening it.
- Full natural English in complete short sentences. **Never invent shorthand**: no telegraph lines (`五 8/28 5pm · 270 HW1`), no arrow chains, no codenames.
- No preamble, no "Batch N", no schedule-suggestion prose — deadlines already order the work.
- The file is an outward deliverable, not your scratchpad: no meta notes, no access caveats, no attendance-only events. All of that goes to chat.
- Unsure whether something belongs in the file? Ask. Don't pad.

## Never

- Never rewrite or reorder previous batches, or touch their checkboxes.
- Never put a credential, a caveat, or your process narration into any file in the vault.
- Never link a local file you haven't verified, or ship a batch with a deadline you haven't seen at its source.
