# Aurora Local - Agent Guide

## Purpose

Aurora Local is a personal local AI assistant built with Node.js, plain HTML/CSS/JavaScript, SQLite, and Ollama.
It is designed to help with programming, databases, websites, games, documents, local project planning, defensive security, and learning resources.

## How To Run

```powershell
npm start
```

Open:

```text
http://localhost:3123
```

## How To Validate

```powershell
npm run check
npm test
```

`npm run check` validates JavaScript syntax.
`npm test` runs the smoke test against the running local server.

## Main Files

- `server.js`: HTTP server, API endpoints, SQLite persistence, Ollama calls, planning helpers, resource scanners.
- `public/index.html`: app layout and panels.
- `public/app.js`: frontend state, API calls, renderers, event handlers.
- `public/styles.css`: visual design.
- `tests/smoke.mjs`: endpoint smoke test.
- `README.md`: user documentation.
- `data/aurora.sqlite`: central SQLite database.
- `data/resource-library.json`: summaries of external libraries.
- `external-resources/`: large portable reference folders, ignored by normal indexing.

## Important Features

- Chat with Ollama models.
- Model routes by mode: general, programming, database, architecture, fallback.
- Persistent sessions, memory, knowledge, missions, SQL history, change log, permissions.
- Project index and code map.
- Missions, advanced executor, game creator, security planner, quick security audit.
- SQL schema/query/explain/analyze panel.
- Assisted file editing with backups and change log restore.
- Document generation for Markdown, CSV, and HTML.
- Portable checks for moving Aurora to another PC.
- External resource library for large folders like AI courses or devtool references.

## Current Local Resource Libraries

- `external-resources/Diplomado-master`: AI/deep learning course with notebooks and datasets.
- `external-resources/awesome-ai-devtools-main`: curated AI developer tools list.

Do not scan `external-resources/` in the normal project index or file tree.
Use the resource library summary instead.

## Coding Rules

- Keep changes scoped and compatible with plain Node.js.
- Do not add dependencies unless the feature clearly needs them.
- If adding persistence, prefer SQLite for central app state.
- If adding generated/reference artifacts, keep them under `data/`, `generated/`, or `external-resources/`.
- Preserve existing API response shapes unless updating tests and UI together.
- Always create safe fallbacks for missing Ollama, missing models, or unavailable optional tools.
- Prefer small local deterministic planners for UI panels that must be fast.
- Use Ollama only where model reasoning is needed.

## Safety Rules

- Aurora should build legitimate tools, websites, games, documents, automations, SQL helpers, and defensive security workflows.
- Aurora should not help create malware, steal data or credentials, bypass security, invade systems, fraud, or cause real-world harm.
- For risky local actions, prefer confirmation, backups, allowlists, validation, and clear recovery steps.

## UI Guidance

- Keep panels compact and practical.
- Show errors in the relevant panel instead of failing silently.
- Do not add marketing/landing-page style UI.
- Keep repeated items as `knowledge-item` cards unless a more specific pattern exists.
- After frontend changes, run syntax checks and verify the affected panel in the browser.

## Useful Next Improvements

- Create a site/app builder panel.
- Add delivery checklist per mission.
- Add safer dependency installer suggestions.
- Improve semantic search for large projects.
- Add patch review workflow before large edits.
- Add export/import backup for Aurora configuration and resource summaries.
