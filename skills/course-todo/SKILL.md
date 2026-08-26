---
name: course-todo
description: Build or extend a cumulative course to-do list (todo.md) in an Obsidian folder from Canvas LMS and professor course sites, downloading every reachable course PDF into a 资料 subfolder. Use when the user asks to update their course todo, plan homework for a date range, or collect course materials. Inputs: the Obsidian folder, and the date range to cover.
---

# Course Todo

Maintain two things inside the user's chosen Obsidian folder:

1. `todo.md` — a cumulative, batched to-do list (one batch per request).
2. `资料/` — a flat folder of downloaded course materials that `todo.md` links to.

## Inputs

Ask only if not given:
- **Obsidian folder** — absolute path. Expect a course-overview note in it (course names, numbers, Canvas course ids, Gradescope/site links, grading, calendar). Read it first; it is the source of truth for where things are submitted and when.
- **Date range** — "update me through <date>". The new batch covers today through that date.

## Data collection (via the bundled canvas MCP)

The plugin ships an MCP server (`canvas`) whose auth is the user's own browser session cookies, stored locally on the user's machine, read-only access to their own course data. Tools: `set_cookie(domain?, cookie)`, `which_cookies()`, `download(url, out_path)`, `fetch(url)`, plus Canvas helpers `list_courses`, `course_tabs`, `list_folders`, `list_files`, `list_assignments`, `announcements`, `list_pages`, `get_page`, `api_get(path)`. Set `CANVAS_HOST` env if the school is not canvas.duke.edu.

Rules learned the hard way:

- **Try stored cookies first.** Only ask the user for a cookie when a tool errors with cookie missing/expired. Then walk them through it with these instructions verbatim:
  > Open the page in Chrome and log in → press F12 → go to the **Network tab** (not "view source") → refresh the page → click the top request of type *document* → under **Request Headers**, copy the entire `cookie:` line's value → paste it back to me.
  Then call `set_cookie(domain, cookie)`. Canvas cookies last days; Shibboleth/SSO cookies for professor sites last only hours — expect to re-ask. The session cookie is a credential: it goes only into `set_cookie`, never into any file you produce, never into chat output.
- Many courses close the **Files** tab to students (unauthorized) → go through **Modules** (`api_get("/courses/:id/modules?include[]=items")`) or **Assignments** instead; a module file item's API URL must be GET once more to obtain the real `.url` download link. Some courses close Pages too.
- Course content often lives OUTSIDE Canvas on a professor's public site — `fetch` the site, harvest links. Google Docs export as PDF via `https://docs.google.com/document/d/<id>/export?format=pdf`.
- Lecture recordings (Panopto/Zoom) are unreachable via API — they stay hyperlinks.

## 资料: the materials folder

**Download every reachable PDF/file the batch needs — Canvas files AND professor-site files.** Only truly gated things (SSO-blocked pages you have no cookie for, videos, submission portals) stay as web hyperlinks.

- Naming: `<courseNumber>_<Category><NN?>_<Name?>.<ext>` — e.g. `270_HW1.pdf`, `350_Slides01_Intro.pdf`, `350_SlidesAll_Spring2024.pdf`, `270_Notes_TransmissionLines.pdf`, `350_Setup_Git.pdf`, `662_Slides_CL01.pdf`, `662_Syllabus.pdf`, `371_Assign0_notebook.ipynb`, `350_PracticeMidterm1_Spring2023.pdf`, `270L_Lab1.pdf`. Categories in use: HW, Assign, Slides, SlidesAll, Notes, Setup, Lab, Syllabus, PracticeMidterm, FinalProject.
- **Never write a download straight into 资料.** Download to a temp dir, verify (correct MIME type; PDFs end with `%%EOF`; size matches Content-Length — the MCP `download` enforces length), then copy in. A truncated PDF opens blank; a blind re-download over a good file can clobber it with a login page.

## todo.md: exact format

Cumulative: each request appends a new batch section under the single `# TODO` title, **newest batch first**. Never rewrite old batches; the user checks boxes in them.

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

Hard rules (each exists because a user demanded it):

- **Full natural English. Never invent shorthand** — no telegraph style like `五 8/28 5pm · 270 HW1`, no arrow chains, no made-up labels. Complete short sentences.
- Batch header is `## Before <M/D>` — nothing else, no "Batch 1", no preamble line under `# TODO`.
- Two sections per batch: `### Study`, `### Submit`. One checkbox per item.
- Study lines: `<course>: <verb> [<material>](资料/<file> or url)< — why it matters, few words>`. Only material that **directly helps this batch's assignments/quizzes/deliverables**. No "preview next week", no general enrichment.
- Submit lines: **course + item first**, destination as a link, **deadline in 【】 last**: `270 HW1 → [Gradescope](url) 【Fri 8/28, 5pm】`. Flag AM deadlines loudly (`11:59 **AM** — noon, not midnight`).
- Each real assignment gets ONE indented sub-bullet: link to the local copy + a one-line content breakdown (problem count, points, topics).
- The file is an outward deliverable, not a scratchpad: **no meta notes, no access caveats, no attendance-only events** (a lab where nothing is submitted is said in chat, not written into the file). Deadlines already order the work — no schedule-suggestion prose.
- Hyperlinks: local materials as `[name](资料/file.pdf)` relative links; videos, submission portals, and anything not downloadable as normal web links.
- When unsure whether something belongs in the file, ask the user instead of adding it.

## Chat conduct

Say in chat (never in the file): attendance reminders, access limitations, what could not be downloaded and why, and the cookie re-grab instructions when needed. Report what was downloaded with page counts/sizes so the user can spot a bad file.
