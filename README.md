# harness-engineer

`harness-engineer` is an open-source Codex-first scaffolding CLI for repository-owned orchestration workflows.

It packages the "harness as files" pattern into a reusable npm package: fixed roles, durable memory, runbooks, record-system docs, and execution-plan artifacts can all be generated into a blank repository with one command.

中文说明见 [README.zh-CN.md](./README.zh-CN.md)。

> License: [MIT](./LICENSE)
> Package: [`harness-engineer` on npm](https://www.npmjs.com/package/harness-engineer)

## Why This Shape

The default preset is now aligned with OpenAI's harness engineering article:

- keep the Codex entrypoint short
- treat repository docs as the system of record
- keep execution plans versioned and durable
- give agents progressively deeper context instead of one giant instruction file

The article uses `AGENTS.md` conceptually. This package generates `AGENTS.override.md` because that is the Codex entrypoint this tool targets.

## What It Creates

- `AGENTS.override.md` as the short Codex collaboration map
- `.codex/config.toml` and fixed role files under `.codex/agents/`
- durable memory under `.codex/memory/`
- `ARCHITECTURE.md` plus record-system docs under `docs/design-docs/`, `docs/product-specs/`, `docs/generated/`, and `docs/references/`
- execution-plan folders under `docs/exec-plans/` and run artifacts under `logs/codex/`
- a machine-readable `harness-engineer.config.json`

## Quick Start

The package is published on npm. The fastest way to scaffold a new repository is:

```bash
pnpm dlx harness-engineer@latest init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes

harness-engineer task new 2026-04-02-auth-debug --class B
harness-engineer status
```

If you are running from this source repository:

```bash
pnpm install
pnpm build

node dist/cli.js init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes
```

## Install Options

### From npm without installing globally

```bash
pnpm dlx harness-engineer@latest init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes
```

### Install into an existing project

```bash
npm install -D harness-engineer
npx harness-engineer init . --preset generic-software --project-name "Acme Platform"
```

### Install directly from GitHub

```bash
npm install -D git+https://github.com/Dai5297/harness-engineer-codex.git
npx harness-engineer init . --preset generic-software --project-name "Acme Platform"
```

## Presets

### `generic-software`

The default preset for Codex-driven software repositories.

Fixed roles:

- `architect-backend`
- `architect-frontend`
- `runtime-integrations`
- `product-ui`
- `reviewer`
- `qa-guard`

Record-system docs are organized like this:

- `ARCHITECTURE.md`
- `docs/design-docs/`
- `docs/product-specs/`
- `docs/generated/`
- `docs/references/`
- `docs/exec-plans/`

## Language Modes

`init` supports three output modes:

- `en` for English-only harness files
- `zh` for Chinese-localized harness files
- `bilingual` for bilingual harness docs, including `AGENTS.override.md`

Canonical file paths stay unchanged across all three modes.

## CLI

### `init`

```bash
harness-engineer init [dir] \
  --preset <preset> \
  --project-name <name> \
  [--language en|zh|bilingual] \
  [--dev-command "<cmd>"] \
  [--force] \
  [--yes]
```

Notes:

- generates files only when missing by default
- use `--force` to overwrite managed templates
- `--dev-command` generates `.codex/environments/environment.toml`
- `init` also adds `harness-engineer` to `devDependencies`

### `task new`

```bash
harness-engineer task new <slug> --class A|B|C
```

Creates:

- `docs/exec-plans/active/<slug>.md`
- `logs/codex/active/<slug>/run.md`
- `logs/codex/active/<slug>/handoff.md`

### `task archive`

```bash
harness-engineer task archive <slug>
```

Moves the task from active to completed and appends completion sections to the plan if needed.

### `status`

```bash
harness-engineer status
```

Reports:

- active tasks
- missing managed files
- drifted managed files
- inconsistent task artifacts

## Local Development

```bash
pnpm install
pnpm test
pnpm test:coverage
pnpm build
```

The package is intentionally source-first. `dist/`, `coverage/`, and `node_modules/` are generated locally and are not meant to be committed.

## Testing Strategy

- unit tests for rendering, config helpers, and preset selection
- integration tests for init, task lifecycle, CLI smoke flow, and status drift detection
- independence checks to ensure generated output does not retain external-project identifiers or machine-local paths

## Repository Layout

```text
src/      source code for the CLI and generators
tests/    unit and integration tests
```

## Open-Source Release Notes

Before publishing updates, review [OPEN_SOURCE_RELEASE_CHECKLIST.md](./OPEN_SOURCE_RELEASE_CHECKLIST.md).
