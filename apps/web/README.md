# Library of Eternity Platform v0.4

A governed local authoring and review environment for the Library of Eternity Foundation repository.

## v0.4 additions

- Provenance Explorer
- Per-document constitutional lineage
- Amendment and supersession dashboard
- Upstream/downstream dependency tracing
- Provenance health and broken-lineage checks
- Institutional change-ledger integration


## What v0.4 adds

- Governed document creation and editing
- Research Lock enforcement for new AA, FO, and ADR records
- Duplicate ID and dependency validation
- Workflow states: Draft, Under Review, Approved, Locked, Retired
- Amendment references for revisions to approved or locked records
- Automatic snapshots before every governed revision
- Machine-readable change log and document history pages
- Review queue and workflow dashboard
- Release manifest generation and health gates
- Existing archive, search, graph, registry, and health features from v0.2

## Important deployment note

The authoring features write directly to `content/foundation/`. They are intended for a trusted local or self-hosted Node.js environment with a writable filesystem. They are not suitable for a public deployment until authentication, authorization, database-backed persistence, and CSRF protection are added.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run validate:library
npm run build
```

The production build compiles, type-checks, and generates all static pages. In the current build environment, Next.js may remain active during its final build-trace collection step after page generation has completed.

## Key routes

- `/documents` — browse the archive
- `/graph` — dependency explorer
- `/author` — create a governed record
- `/author/[id]` — revise an existing record
- `/review` — workflow and recent-change dashboard
- `/history/[id]` — immutable revision trail
- `/releases` — release gates and manifest generation
- `/health` — repository integrity checks
