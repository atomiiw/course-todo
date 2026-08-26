# course-todo

A Claude Code plugin that keeps a **cumulative course to-do list** (`todo.md`) in your Obsidian vault, built from Canvas LMS and professor course sites. Every batch you request, it:

- pulls assignments, due dates, readings, and files from Canvas (and public professor sites),
- **downloads every reachable PDF** into a `资料/` materials folder (integrity-verified — no silent half-downloads),
- appends a clean, ADHD-friendly `## Before <date>` batch to `todo.md`: a **Study** list (only what directly helps this batch's work) and a **Submit** list (`270 HW1 → [Gradescope](…) 【Fri 8/28, 5pm】`), with local links to the downloaded materials.

## Install

```
/plugin marketplace add atomiiw/course-todo
/plugin install course-todo@atomiiw
```

Requires Node.js (the bundled MCP server is a single zero-dependency `.mjs` file).

## Use

> update my course todo through 9/3 — vault folder is ~/Documents/Obsidian Vault/My Semester

Give it: your Obsidian folder, and the end date of the range. Keep a course-overview note in that folder (course numbers, Canvas course ids, Gradescope links, schedule) — the skill reads it as its map. Each new request appends a new batch; old batches and their checkboxes are never touched.

## Authentication

Your school probably disables student API tokens, so the bundled `canvas` MCP server authenticates with **your own browser session cookies**. Nothing is stored anywhere except `~/.canvas-mcp/cookies/` on your machine (mode 600), and access is read-only. When a cookie is missing or expired, Claude walks you through copying it out of your browser's DevTools Network tab and saves it via the `set_cookie` tool. Canvas cookies last days; Shibboleth/SSO cookies for professor sites last hours.

Not at Duke? Set your Canvas host once:

```json
// in the plugin's mcpServers config or your environment
"env": { "CANVAS_HOST": "canvas.yourschool.edu" }
```

## What's inside

- `skills/course-todo/SKILL.md` — the workflow + exact file layout, naming scheme, and todo format rules
- `mcp/canvas-mcp.mjs` — zero-dependency stdio MCP server: `set_cookie`, `which_cookies`, `download` (length-verified), `fetch`, and Canvas helpers (`list_courses`, `course_tabs`, `list_folders`, `list_files`, `list_assignments`, `announcements`, `list_pages`, `get_page`, `api_get`)
