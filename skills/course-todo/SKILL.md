---
name: course-todo
description: Use a shared Obsidian course-material opening, then create either cumulative course todos or a lecture-based tailored textbook. Route todo requests to live deadline planning and textbook requests to one course's existing materials, preserving the blue/green teaching template. Collect Canvas materials only as needed by the requested workflow.
---

# Course workspace

One parent skill, one materials opening, two output workflows. Keep the `course-todo` name for existing installations and invocations.

## Shared opening

1. Resolve the supplied Obsidian folder, course overview, course(s), requested scope, and existing materials. Read [references/materials.md](references/materials.md).
2. Identify the requested output from the user's words. Do not ask them to choose when it is already clear.
3. Check readiness. For a textbook, the normal input is **one course's existing local files**, including previous tailored chapters. Ask for specific missing essential materials or scope. Do not restart collection merely because a file is missing.
4. If collection is explicitly requested, run the common Canvas/professor-site workflow once and save verified downloads into `资料` first. Todo planning also requires the live source checks in its own workflow. Reuse the same collected materials if both outputs are requested.

## Output routes — load only what is requested

| Request | Referenced workflow | Output |
|---|---|---|
| Update course todo, plan deadlines through a date | [references/todo.md](references/todo.md) | A new cumulative `todo.md` batch plus verified linked materials |
| Generate/improve a tailored textbook from lecture notes and readings | [references/textbook.md](references/textbook.md) | One course's native Obsidian textbook and needed figure assets |
| Both | Read both references after the shared opening | Both outputs, sharing materials but keeping their purposes separate |
| Only obtain materials | Finish the requested collection in [references/materials.md](references/materials.md) | Verified local materials; no unsolicited todo/textbook |

## Invariants

- Never put session cookies into vault files, templates, examples, repository files, chat echoes, or logs. Use the bundled MCP's authentication flow.
- Preserve prior todo batches, checkboxes, textbook chapters, source files, and vault styling unless the requested edit specifically targets them.
- Textbooks use professor lectures as the spine, textbook explanations/figures to justify derivations, and homework only as private coverage prioritization. Never silently turn the textbook into a homework walkthrough.
- Preserve the original blue/green callouts, Lecture/H3 hierarchy, and heading voice. Avoid reteaching concepts already explained in previous chapters.
- Report unreachable/missing inputs explicitly. A completed template or skill is not evidence that an existing textbook has been revised; verify the actual requested artifact.
