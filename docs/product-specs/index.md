# Product Specs Index

## Current state

- No repo-specific product specs are checked in yet.
- The closest current user-facing contract sources are `README.md`, CLI help in `src/cli/run.ts`, and the integration tests under `tests/integration/`.

## Write a product spec when

- a CLI command gains new flags or behavior that users must reason about
- `init`, `enrich`, `status`, or `task` semantics change in ways that need explicit acceptance criteria
- language-mode behavior changes
- template output changes in a way downstream repos will notice

## Good first spec topics for this repo

- `harness enrich` expected behavior and non-goals
- `harness status` drift-reporting semantics
- Execution-plan lifecycle and the intended meaning of task classes

## Starter template

Create new specs from `docs/product-specs/template.md`.
