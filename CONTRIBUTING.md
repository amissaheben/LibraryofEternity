# Contributing to the Library of Eternity

## Core rule

The Constitution governs every contributor. No document, feature, or institutional mechanism is exempt from repository validation and provenance requirements.

## Branches

- `main` — stable and releasable work
- `development` — integration branch
- `research` — non-canonical research artifacts
- `release` — release-candidate preparation
- `feature/*` — isolated implementation work

## Commit format

Use meaningful conventional commits:

```text
feat(auth): implement trustee sessions
fix(graph): prevent circular dependency rendering
docs: clarify constitutional provenance
refactor(validator): isolate evidence checks
```

## Pull requests

Every pull request must state:

1. the problem being solved;
2. the constitutional or engineering authority for the change;
3. affected dependencies;
4. validation performed;
5. rollback or retirement implications.

## Canonical restrictions

While Research Lock is active:

- no new AA volume may be introduced;
- no Foundation Observation may be promoted;
- no CSC primitive may be registered;
- research artifacts remain non-canonical until the audit pipeline authorizes promotion.

## Quality requirements

- TypeScript must remain strict.
- Avoid `any`.
- Keep modules focused and reusable.
- Add or update validation for every new data rule.
- Preserve retired and superseded records rather than deleting institutional history.
