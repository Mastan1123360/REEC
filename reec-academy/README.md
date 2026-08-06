# REEC Academy

An interactive learning engine that turns engineering-curriculum markdown
into a rich, widget-driven educational experience. **The curriculum is
data. The platform is the engine.** Lesson authors write markdown files
with YAML front matter and `:::block` directives; nothing about routing,
layout, or interactivity is hand-wired per lesson.

## Quickstart

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (statically generates every lesson)
npm run typecheck
```

## Starting state: everything is "Coming Soon" until you upload

`/content` ships empty (just a `.gitkeep` so the folder exists in git).
Every one of the 9 roadmap phases (`lib/content/roadmap.ts`) renders as
a dashed **Coming Soon** card on the dashboard, a collapsed row in the
sidebar, and an empty state on `/phase/[id]` — until you upload a lesson
for it. The moment a `.md` file lands under
`content/Phase-XX/Week-YY/Day-ZZ.md`, that exact slot switches to live
content automatically.

**Once all 9 phases have at least one lesson, uploading is disabled
everywhere** — the header's Upload button, the `/upload` page, and the
upload API route itself (`lib/content/discover.ts`'s
`isCurriculumComplete()`, checked in all three places) — rather than
left available with nothing meaningful left to add.

Two fully-worked example lessons live in `/examples` for reference on
the authoring format — intentionally **outside** `/content`, so
`discover.ts` never scans them.

## How a lesson becomes a page

```
content/Phase-01/Week-03/Day-01.md
        │  (fs walk, zero manual routing — lib/content/discover.ts)
        ▼
gray-matter front matter, defensively normalized (lib/content/parser.ts)
        │  (coerces common YAML mistakes instead of crashing — see below)
        ▼
isolateReecFences()  — normalizes ::: fence lines so authors don't need
        │               to remember blank-line discipline
        ▼
remark-parse + remark-gfm  → mdast tree
        │
        ▼
remarkReecBlocks()  — walks the AST and re-parents every ":::kind[Title]
        │               ... :::" span into a `reecBlock` node
        ▼
per-section HTML render: remark-rehype → rehypeShiki (syntax highlighting)
        │               → rehype-raw → rehype-slug → rehype-stringify
        ▼
Lesson object: { frontmatter, sections[], blocks[], readingTimeMinutes, ... }
        │
        ▼
buildSemanticModel()  → interpretLesson()  → LessonExperience
        │  ("what's in it")   ("how to teach it")   (assembles the page)
        ▼
Widget Registry lookup by block.kind  →  React component
```

Route `[...slug]` + `generateStaticParams` mean there is no hardcoded
page per lesson — dropping a new `.md` file under `/content` is the
entire authoring workflow.

### Front matter is defensively normalized, not just trusted

Real hand-written YAML breaks in predictable ways —
`normalizeFrontmatter` coerces the common ones instead of crashing:
list items with an unquoted colon (a classic YAML gotcha that parses as
an object, not a string) flatten back into readable text;
`difficulty` written as a word ("Beginner") maps to 1–5;
`estimated_time` written as a bare number gets a display string.

## The widget engine (plugin architecture)

Every `:::kind` block maps 1:1 to a component registered in
`lib/widgets/index.ts`:

| Directive | Widget | Interactivity |
|---|---|---|
| `:::story` | `StoryCard` | — |
| `:::mental-model` | `MentalModelCard` | — |
| `:::engineering-note` | `EngineeringNote` | Expandable insight card |
| `:::production-note` | `ProductionNote` | Expandable insight card |
| `:::historical-context` | `HistoricalContext` | Expandable, interactive timeline styling |
| `:::worked-example` | `WorkedExample` | Run → opens Code Workspace with real source |
| `:::compiler-thinking` | `CompilerThinking` | Prediction-then-reveal |
| `:::mini-challenge` | `MiniChallenge` | Hint/solution reveal, interactive checklist, mark-done, "write my solution" → Code Workspace |
| `:::reflection` | `Reflection` | Persisted free-text notes |
| `:::project` | `ProjectBlock` | Interactive checklist, difficulty badge |
| `:::reading` | `ReadingBlock` | — |

Unregistered kinds fall back to `UnknownBlock` — a missing widget
implementation never breaks a lesson page.

**Hint/solution reveal** (`lib/content/reveal-sections.ts`) recognizes
the curriculum's own existing authoring convention — paragraphs
starting with "**Hint:**", "*Weakest hint:*", "**Solution:**",
"**Answer:**" — and wraps them in native `<details>`/`<summary>`,
collapsed by default. No new markdown syntax to learn.

**Interactive checklists** (`components/experience/
InteractiveChecklist.tsx`) turn remark-gfm's static, `disabled`
task-list checkboxes into real ones, persisted per-item in the progress
store — used by `ProjectBlock` and `MiniChallenge`.

**Adding a new plugin widget** (e.g. a real Ownership Visualizer, Borrow
Timeline, Memory Viewer — stubs for all eight already registered in
`lib/widgets/future-plugins.tsx`) is exactly one file + one registration
call in `lib/widgets/index.ts` — no lesson file ever needs to change.

## The Lesson Engine (semantic model → interpreter → experience)

```
Lesson (parsed)
  → buildSemanticModel()   lib/semantic/model.ts
      "what is in this lesson" — concepts, key terms, block inventory,
      difficulty/time, ownership/borrowing detection — deterministic,
      derived from data the parser already extracted.
  → interpretLesson()      lib/semantic/interpreter.ts
      "how should this be taught" — a rule engine deciding which
      study-session modules to render and which per-block visualizer
      enhancements apply (e.g. a block introducing ownership gets
      Memory Viewer / Ownership Timeline chips attached automatically).
  → LessonExperience        components/experience/LessonExperience.tsx
      assembles MissionHeader, ConceptMap, LessonRenderer,
      CompletionSummary, NextLessonPreview into the final page.
```

`MissionHeader` ("Today's Mission" — synopsis auto-pulled from the
lesson's own story/mental-model block), `ConceptMap` (highlights this
lesson's position in the curriculum-wide concept ontology,
`lib/semantic/ontology.ts`), `SmartCode` (every plain fenced code block
gets Copy / Run / Expand-Collapse automatically), `CompletionSummary`
(auto-built checklist from the lesson's Mini Challenge blocks + Project
deliverable), `NextLessonPreview`.

## Code Workspace — a real, multi-language compiler

Any Worked Example's **Run** button, any plain code block's Run icon,
and every Mini Challenge's **Write my solution** button open a real
editor + compiler in a panel on the right
(`components/workspace/CodeWorkspace.tsx`), backed by
`app/api/compile/route.ts`. ⌘/Ctrl+Enter runs; Escape closes.

Supports **Rust, Python, Java, C, and C++**
(`lib/workspace/languages.ts`), each routed to whichever real backend
actually handles it:

- **Rust** → `play.rust-lang.org/execute` — the same backend the
  official Rust Playground website uses.
- **Python / Java / C / C++** → the public
  [Piston](https://github.com/engineer-man/piston) execution API.
  If you see `HTTP 401` from this endpoint, Piston's public instance may
  now require authentication that it didn't when this was built — set
  `PISTON_EXECUTE_URL` / add an `Authorization` header in
  `app/api/compile/route.ts`, or self-host Piston via its own Docker
  image and point the route at your instance. Swapping the backend is a
  one-file change; nothing in the editor UI needs to know.

Both branches normalize to `{ success, stdout, stderr }`, so adding a
6th language is one entry in `languages.ts`.

**Focus mode**: the moment the workspace opens, the lesson content
behind it is hidden (`components/workspace/FocusBackdrop.tsx`) so
you're working from your own head, not the answer still on screen. The
hamburger icon in the workspace panel's header toggles the lesson back
into view without closing the workspace.

There's also a **standalone Code Workspace page** at `/workspace` — a
general-purpose sandbox with its own language picker, completely
independent of any lesson (separate local state from the lesson-
triggered panel, so opening one never affects the other).

## Top-right menu: Code Workspace, Bookmarks, hello_reec

`components/HamburgerMenu.tsx` — three destinations:

- **Code Workspace** (`/workspace`) — the standalone sandbox above.
- **Bookmarks** (`/bookmarks`) — every lesson you've bookmarked, read
  from the client-side progress store and resolved against
  `/api/lessons/list`.
- **hello_reec directory** (`/hello-reec`) — a *persistent* personal
  file store (`lib/files/store.ts`, localStorage-backed, distinct from
  the Code Workspace's ephemeral scratchpad), matching the original
  curriculum's Lab 0.1 ("a committed `hello_reec` repository..."). This
  is where the actual deliverables lessons ask students to create live:
  create/rename/delete files, edit and run them, all saved across
  sessions.

## Uploading lessons through the web app

1. Click **Upload lesson** in the header (hidden once all 9 phases have
   content — see above).
2. Pick Phase / Week / Day and drop in a `.md` file.
3. `app/api/lessons/upload/route.ts` writes it to
   `content/Phase-XX/Week-YY/Day-ZZ.md`, normalizes its front matter to
   match where you placed it, busts the in-memory content cache, and
   calls `revalidatePath`. Live on the next request.

> **Hosting note:** the upload route writes to the server's local
> filesystem — correct for `npm run dev` or any always-on Node server.
> On ephemeral serverless hosting, an upload persists for that running
> instance but won't survive a redeploy; swap the write step for real
> storage if you need uploads to persist there.

## Search

`components/SearchDialog.tsx` — ⌘K anywhere, full keyboard navigation
(↑↓ to move, ↵ to open), phase-tagged results, debounced against
`/api/search`.

## Deploying

Push to a Git repo and import into Vercel — zero configuration needed;
`next build` statically generates every discovered lesson page.
