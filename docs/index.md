# Harness Engineer Codex Documentation Index

Use this file as the routing table for the package itself, not for a downstream repo created by the package.

## Start here

- `AGENTS.override.md` for how future Codex sessions should approach this repository
- `ARCHITECTURE.md` for the real module boundaries and runtime constraints
- `README.md` for the published package contract and user-facing workflows
- `harness-engineer.config.json` for the scaffold model this repo currently declares for itself

## Route by task

- Changing CLI behavior or prompts: `ARCHITECTURE.md`, `src/cli/`, `src/commands/`, `tests/integration/cli.test.ts`
- Changing scaffolded content: `docs/DESIGN.md`, `templates/generic-software/`, `templates/_locales/generic-software/zh/`, `src/core/template-loader.ts`
- Changing enrich or Codex behavior: `docs/RELIABILITY.md`, `docs/SECURITY.md`, `src/core/enrich-service.ts`, `src/core/codex-runner.ts`, `tests/integration/enrich.test.ts`
- Changing plan or drift semantics: `docs/PLANS.md`, `src/core/task-service.ts`, `src/core/status-service.ts`, `tests/integration/tasks.test.ts`
- Reviewing product positioning: `docs/PRODUCT_SENSE.md`, `README.md`, `CHANGELOG.md`
- Checking current validation posture: `docs/QUALITY_SCORE.md`, `CONTRIBUTING.md`, `vitest.config.ts`, `tests/`

## Source-of-truth documents

- `AGENTS.override.md` for collaboration rules, role boundaries, and Codex usage in this repo
- `ARCHITECTURE.md` for the module map, command flows, and current drift/open questions
- `docs/DESIGN.md` for template and documentation experience rules
- `docs/FRONTEND.md` for CLI/readme/doc UX boundaries and the explicit absence of a browser frontend
- `docs/PLANS.md` for execution-plan mechanics and current gaps
- `docs/PRODUCT_SENSE.md` for supported user jobs, non-goals, and stable vocabulary
- `docs/QUALITY_SCORE.md` for current evidence-backed quality scoring
- `docs/RELIABILITY.md` for workflow failure boundaries and operator guidance
- `docs/SECURITY.md` for trust boundaries, validation points, and external process risk
- `docs/design-docs/index.md` and `docs/product-specs/index.md` for where deeper repo-specific documents should be added
- `docs/references/index.md` for durable external anchors already referenced by the repo

## Recommended read order

1. `AGENTS.override.md`
2. `.codex/config.toml` and the relevant `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. `README.md`
5. The most relevant document under `docs/`
6. The active execution plan, if one exists
7. Only then the code and tests

## Current gaps and caveats

- There are no repo-specific design docs or product specs beyond the index and template files yet.
- `docs/generated/db-schema.md` is scaffold placeholder content. Do not treat it as evidence of a real database in this repo.
- `dist/` and `coverage/` are useful verification artifacts, but edits belong in `src/`, `templates/`, README, and the harness docs.
