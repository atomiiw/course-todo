# course-todo

One Claude Code plugin for an Obsidian course workspace, with a shared materials opening and two referenced output workflows:

```text
Obsidian folder + course context + existing materials
                     │
       readiness / requested Canvas collection
                     │
          ┌──────────┴──────────┐
          │                     │
       todo.md             textbook.md
  deadlines + checkboxes   lecture-based teaching
```

The parent skill keeps its existing `course-todo` name. No second repository or separately maintained Canvas authentication is needed.

## Install

```
/plugin marketplace add atomiiw/course-todo
/plugin install course-todo@atomiiw
```

Requires Node.js for the bundled zero-dependency Canvas MCP.

## Use

**Todo:** “Update my course todo through 9/25 — the folder is …”

Uses the overview to locate courses and submission portals, verifies live deadlines, downloads referenced materials, and adds a cumulative Study/Submit batch without changing previous checkboxes.

**Textbook:** “Generate the next ECE 270 textbook from the files in this Obsidian folder, through Lecture 7.”

Consumes one course's existing lectures, readings, figures, homework, and previous chapters. If essential inputs are missing, it asks for them; it does not automatically resync Canvas. Output uses the original blue professor-note / green explanation callouts, lecture groups, and numbered study bites. Teaching follows the steps leading to the professor's equations and explains their implications. Homework privately prioritizes coverage; questions and solutions do not appear in the textbook. Earlier chapters are referenced instead of retaught.

**Collect, then write:** “Download the latest ECE 270 materials into 资料, then generate the next textbook.”

Runs the shared collection first, verifies files, then hands them to the textbook workflow. If both a todo and a textbook are requested, they reuse the collected materials.

## Authentication

The shared Canvas MCP uses the user's browser session cookie stored locally under `~/.canvas-mcp/cookies/`. Use stored cookies first unless the user requests otherwise. When missing/expired, guide the user through Chrome DevTools → Network → refresh → document request → Request Headers → cookie value, then use `set_cookie`. Credentials never belong in artifacts or this repository. Canvas operations are read-only; downloads and cookie storage are local writes.

For other schools, set `CANVAS_HOST` in the MCP environment.

## Structure

- `skills/course-todo/SKILL.md` — parent/router and shared opening
- `skills/course-todo/references/materials.md` — course mapping, scoped collection, cookie auth, download integrity
- `skills/course-todo/references/todo.md` — deadline channels, cumulative todo contract
- `skills/course-todo/references/textbook.md` — input/output boundary, teaching process, verification
- `skills/course-todo/references/textbook-style.md` — retained original structure and heading voice
- `skills/course-todo/assets/textbook-template.md` — native reusable Obsidian scaffold
- `mcp/canvas-mcp.mjs` — existing shared Canvas tools, unchanged

Personal course PDFs, textbook pictures, generated chapters, and credentials are not bundled. They stay in the user's Obsidian folder.
