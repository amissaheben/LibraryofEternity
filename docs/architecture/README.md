# Platform Architecture

## Purpose

The platform turns the Library's constitutional repository into a navigable, validated, and governed knowledge system.

## Source of truth

Canonical content remains in version-controlled Markdown with machine-readable YAML front matter. Operational records such as users, reviews, assignments, and activity logs may use PostgreSQL, but the database does not replace the constitutional repository.

## Planned monorepo

```text
apps/
  web/          Next.js institutional interface
  api/          Optional service boundary
packages/
  ui/           Shared interface components
  repository/   Markdown and metadata access
  validator/    Constitutional and graph validation
  graph/        Dependency construction and traversal
  shared/       Common schemas and types
foundation/     Canonical repository
scripts/        Import, validation, release, and health tools
```

## Architectural boundaries

- **Universe content** must not depend on institutional implementation details.
- **Institutional records** must not silently modify canonical truth claims.
- **Meta-history** must preserve why governance changed without becoming ontology.
- Every write operation must be validated server-side.
- Locked documents require explicit amendment authority.

## Initial stack

- Next.js and TypeScript
- Tailwind CSS
- Zod
- PostgreSQL and Prisma
- Auth.js
- React Flow
- Docker
- GitHub Actions

## Security posture

The current prototype is trusted-local software. Public deployment requires authentication, authorization, CSRF protection, rate limiting, secure headers, immutable audit logs, backups, and explicit secret management.
