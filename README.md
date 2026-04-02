# harness-engineer

`harness-engineer` is a small npm CLI that scaffolds a repository-owned harness engineering baseline.

Instead of stuffing every rule into one giant prompt, it generates an `AGENTS.override.md` plus a durable `docs/` structure that future agents can read from the repo itself:

- `AGENTS.override.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `ARCHITECTURE.md`
- `docs/design-docs/...`
- `docs/exec-plans/...`
- `docs/generated/db-schema.md`
- `docs/product-specs/...`
- `docs/references/...`
- `docs/DESIGN.md`
- `docs/FRONTEND.md`
- `docs/PLANS.md`
- `docs/PRODUCT_SENSE.md`
- `docs/QUALITY_SCORE.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`

中文说明见 [README.zh-CN.md](./README.zh-CN.md)。

## Why this shape

The CLI is intentionally document-first:

- project-scoped Codex subagents are kept in-repo instead of living only in a personal config
- `AGENTS.override.md` is the single Codex bootstrap and collaboration guide
- architecture and product knowledge live in dedicated files
- multi-step work gets a durable execution plan
- reviewers and testers can rely on repo context, not disappearing chat history

## Quick start

Install the package globally so `harness` is available on your PATH:

```bash
npm install -g harness-engineer
```

Create a fresh harness baseline in an empty project:

```bash
harness init . --project-name "Acme Platform" --yes
```

Enrich an existing repository with harness docs plus a Codex-powered background pass:

```bash
harness enrich . --yes
```

Then open a tracked task:

```bash
harness task new 2026-04-02-auth-debug --class B
harness status
```

If `harness` is not found after global install, make sure your npm global bin directory is on PATH.

`harness enrich` requires a working local Codex CLI. If Codex is installed but not authenticated yet, run `codex login` before retrying.

## CLI

### `init`

```bash
harness init [target-directory] \
  [--project-name <name>] \
  [--preset generic-software] \
  [--language en|zh|bilingual] \
  [--force] \
  [--yes] \
  [--dry-run]
```

Behavior:

- `target-directory` defaults to `.`
- `--project-name` is optional; the CLI infers it from the directory name when omitted
- `--language en` generates English docs, `--language zh` generates Chinese docs, and `--language bilingual` emits English + Chinese in the same markdown files
- `--yes` skips the non-empty directory confirmation
- `--force` overwrites managed harness files
- `--dry-run` prints the plan without writing files

### `enrich`

```bash
harness enrich [target-directory] \
  [--project-name <name>] \
  [--preset generic-software] \
  [--language en|zh|bilingual] \
  [--force] \
  [--yes] \
  [--dry-run]
```

Behavior:

- `enrich` is for existing repositories, not empty directories
- the CLI first creates any missing harness baseline files
- `--language` controls whether the refreshed docs are English, Chinese, or bilingual
- Codex is then invoked with a repo-scoped prompt to update the background docs
- `--force` lets the CLI refresh managed harness files before Codex runs
- `--dry-run` skips both file writes and the Codex invocation

### `task new`

```bash
harness task new <slug> --class A|B|C
```

Creates an execution plan from `docs/exec-plans/template.md` and writes it to `docs/exec-plans/active/<slug>.md`.

### `task archive`

```bash
harness task archive <slug>
```

Moves a plan from `docs/exec-plans/active/` to `docs/exec-plans/completed/` and appends completion sections if needed.

### `status`

```bash
harness status
```

Reports:

- active tasks
- missing managed files
- drifted managed files
- execution plans missing required sections

## Generated role model

The default scaffold documents five collaboration roles:

- Orchestrator
- Planner
- Builder
- Reviewer
- Tester

These roles are documented in the generated repository files and also emitted as project-scoped Codex custom agents under `.codex/agents/`, so explicit subagent delegation can use the same vocabulary as the docs.

## Local development

```bash
pnpm install
pnpm check
pnpm test:coverage
pnpm build
```

## Package contents

The published package ships compiled code from `dist/` plus the filesystem templates under `templates/`.

## License

[MIT](./LICENSE)
