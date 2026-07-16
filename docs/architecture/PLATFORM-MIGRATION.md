# Platform Migration

The v0.4 prototype has been migrated into a monorepo without changing canonical content.

The root `foundation/` directory remains the constitutional source of truth. The web application reads this repository directly and must not silently replace it with database state.
