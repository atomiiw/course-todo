# Obsidian tailored textbook

## Contract and boundary

This is the textbook-output sibling of `course-todo`, not a course-sync or homework-solving skill.

**Input:** an Obsidian folder containing materials for one identified course: professor lecture notes, relevant textbook/readings and figures, homework for internal prioritization, and previous tailored chapters when available. The request or files must identify the target lecture/chapter range.

**Output:** the new or revised native Obsidian Markdown textbook and necessary linked figure assets. Preserve previous chapters and todo files. A request to change this skill does not authorize rewriting an already delivered textbook.

**Process:** convert those materials into instruction. No automatic Canvas sweep, cookie request, download, deadline planning, or reconstruction of the vault. If an essential input or the requested latest lecture is missing/unclear, ask the user for the specific file or scope. Continue independent reading, but do not invent missing coverage or redo the whole collection workflow.

The parent skill handles shared course context and any explicitly requested collection through [materials.md](materials.md). This workflow consumes the resulting local files.

## First acceptance criterion: reproduce the original template

Read the course’s existing tailored textbook, especially the original HW1–3 volume when available. Its format, organization, and heading voice are the canonical reference. Use [textbook-style.md](textbook-style.md) for the retained structure contract and [the native template](../assets/textbook-template.md) as the scaffold. Ask for a missing personal reference when exact comparison is needed; do not fetch or publish course content as a substitute.

- Preserve the original frontmatter structure, CSS class, title pattern `# {course} · From Lecture Notes to {scope}`, and `{term} / Prepared for Atom / {date}` byline. For ECE 270 keep `ece270-study`; for another course inherit its existing style if supplied, otherwise preserve this reference styling. Do not edit vault CSS.
- H2 groups: `Lecture N · ...`, in professor lecture order. H3: continuously numbered natural explanatory headings, matching the original voice. Explain what is being found, shown, or understood rather than giving bare topic names.
- Each H3 follows one coherent learning goal. Scope a bite by conceptual completeness, not a fixed reading or study duration. Split genuinely different goals; allow the reader to spend as long as needed discussing a step.
- Blue: `> [!note] Professor's notes · Lx p.y` (or a page range). Faithful organized lecture content and the professor's progression toward the final equation. Do not attribute added derivations to the professor.
- Green: `> [!tip] Explanation · ...`. Explain missing steps, genuinely new definitions, textbook-supported intuition and figures, conditions, and implications.
- Preserve the existing note/tip colors, blue/green ordering, quote prefixes, math syntax, and relative image/PDF links. Keep continuation lines, tables, equations, and figures inside the intended callout. Do not replace these with a new card system, heading taxonomy, or collapsed answer blocks.
- Finish with `### Sources and corrections`, following the original style. Preserve English unless the user requests another language.
- The reference contains homework-specific passages. The user's later restriction overrides that content: do not reproduce questions, question-number maps, numerical answers, circuits from assignments, or homework walkthroughs.

## Content selection: lectures are the spine, homework is private prioritization

Before drafting, read the target notes, relevant textbook sections/figures, homework, and previous tailored chapters. Privately map:

1. Professor's target equations and reasoning sequence.
2. Concepts emphasized or required by homework.
3. Missing steps or definitions needed to follow that reasoning.
4. What previous chapters already explained.

Use this map to select emphasis, not as a deliverable. Include the requested lecture coverage and the prerequisites genuinely needed to understand it. Homework tells you which distinctions and applications deserve attention; it does not replace the lecture sequence with a problem-solving sequence. Omit unrelated textbook excursions.

## Teaching target: make the final equation understandable

Each bite should make the reader able to explain **what the professor is trying to find, where the final equation comes from, and what the equation implies**.

- Begin from the nearest already-established equation or physical relation. Follow the professor's derivation order, supported by the textbook's explanations and pictures.
- Show meaningful intermediate equations. Beside each non-obvious step, give a short reason: which definition, boundary condition, assumption, substitution, or identity permits it. Do not replace the derivation with a formula list or “after algebra.” Do not mechanically expand every arithmetic step either.
- State the target equation's purpose before showing it. Explain the physical meaning, when it applies, and the sign, limit, or implication needed to interpret it.
- Define genuinely new words and symbols near first use, with units where relevant. Prefer compact **Definition — ...** lines and labeled equations over dense paragraphs, but do not turn every bite into a glossary.
- For concepts already taught in previous chapters, link to the precise earlier heading or give a one-line reminder only when needed for the next step. Do not reteach phasors, complex numbers, elementary circuit laws, or an earlier derivation merely because the current lecture uses them.
- Use textbook figures when they materially explain geometry, directions, boundary conditions, or a step in the derivation. Inspect the actual figure; preserve its relevant labels, page/figure attribution, and connect it explicitly to the equation. Do not insert decorative diagrams or dump screenshots without explanation. Add a diagram only when the provided figures cannot communicate the needed relationship clearly.
- Distinguish source-faithful content from added explanations through the blue/green blocks. Resolve material source errors using the equations and boundary conditions and flag corrections briefly.
- No problem statements, solutions, numerical checkpoints, homework navigation tables, extra exercises, or second homework-reading pass unless independently requested.

## Support learning through conversation

Atom uses the textbook alongside ChatGPT as part of learning. Make the text a reliable shared reference for that discussion; do not treat needing a second explanation as failure or prescribe a pace based on classroom duration.

- Give meaningful derivation steps unique, visible labels such as **Step 6.2 · Select the largest and smallest cosine values** (section.step). Keep the existing H3 and callout hierarchy. A user should be able to identify exactly where they are stuck.
- Keep each step's equation, short justification, and needed local notation together. Briefly recall a symbol's role when the section would otherwise require searching backward; link to earlier conceptual explanations instead of repeating them.
- Let the title and opening establish one clear goal, and the ending explain what the resulting equation means. Avoid redundant goal labels when the existing opening already does this.
- A short introduction may explain the step labels. Do not add mandatory ChatGPT prompt packs, exercises, comprehension gates, or time estimates.

## Authoring and verification

1. Read the live folder and previous chapters; determine the one course and scope. Ask narrowly for missing essential materials. Do not search other courses to fill gaps.
2. Inspect handwritten source pages and relevant figures visually; text extraction alone does not establish diagram topology or equation signs.
3. Draft using the exact reference structure. Check coverage against the private equation/homework map. Check for repeated teaching against prior chapters.
4. For each bite, verify that the final equation is reached by a readable chain of justified steps and that its meaning is explained. Check that the reader can cite a specific step and find the notation and reason needed to discuss it. Remove content that serves neither the lecture's target nor a needed conceptual gap.
5. Check callout structure, math, source page references, figure labels, relative links, and saved file integrity. Inspect rendered figures and a rendered note when available; distinguish structural checks from actual visual inspection in any report.
6. Save beside the existing textbook (or the course's specified output folder), with necessary figure assets. Leave other chapters, source files, todo entries, and styling unchanged. Return a concise note link.
