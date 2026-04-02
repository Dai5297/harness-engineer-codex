# harness-engineer

`harness-engineer` is a Codex-first scaffolding CLI for repository-owned agent orchestration workflows.

It turns the "harness as files" pattern into a reusable npm package: fixed role definitions, durable memory, runbooks, and task lifecycle artifacts can all be generated into a blank repository with one command.

中文说明见 [README.zh-CN.md](./README.zh-CN.md)。

> License: [MIT](./LICENSE)

## What It Creates

- `AGENTS.md` as the short collaboration entrypoint
- `.codex/config.toml` and fixed role files under `.codex/agents/`
- durable memory under `.codex/memory/`
- `docs/index.md` plus runbooks and source-of-truth placeholders
- task lifecycle folders under `docs/plans/` and `logs/codex/`
- a machine-readable `harness-engineer.config.json`

## Quick Start

For published package usage:

```bash
pnpm dlx harness-engineer@latest init . \
  --preset generic-software \
  --project-name "Acme Platform" \
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
  --yes
```

## Install From npm

Without cloning this repository, users can initialize a project directly from npm:

```bash
pnpm dlx harness-engineer@latest init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes
```

Or install it into a project first:

```bash
npm install -D harness-engineer
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

Truth-source docs live under `docs/source-of-truth/`.

### `agentadmin-codex`

A compatibility preset extracted from the AgentAdmin harness structure.

It keeps the AgentAdmin-specific document layering (`dev-docs/ + spec/`) and the original fixed role names:

- `architect-backend`
- `architect-frontend`
- `runtime-executor`
- `console-ui`
- `reviewer`
- `qa-guard`

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

- Generates files only when missing by default.
- Use `--force` to overwrite managed templates.
- `--dev-command` generates `.codex/environments/environment.toml`.
- `init` also adds `harness-engineer` to `devDependencies`.
- `--language bilingual` keeps the base `AGENTS.md` canonical and adds a bilingual `AGENTS.override.md` plus localized core harness docs.

### `task new`

```bash
harness-engineer task new <slug> --class A|B|C
```

Creates:

- `docs/plans/active/<slug>.md`
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
- a self-contained AgentAdmin compatibility snapshot test under `tests/integration/agentadmin-golden.test.ts`

## Repository Layout

```text
src/      source code for the CLI and generators
tests/    unit, integration, and fixture-backed compatibility tests
```

## Open-Source Release Notes

Before publishing updates, review [OPEN_SOURCE_RELEASE_CHECKLIST.md](./OPEN_SOURCE_RELEASE_CHECKLIST.md).
