# harness-engineer

> A repository-first CLI for durable AI collaboration context.

![Node >=20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Docs: en zh bilingual](https://img.shields.io/badge/docs-en%20%7C%20zh%20%7C%20bilingual-4f46e5)

`harness-engineer` is an npm CLI for bootstrapping repository-owned AI collaboration docs.

It installs a `harness` command that creates a durable, file-first working context for Codex and other agents, so the important project knowledge lives in the repo instead of a giant prompt or a disappearing chat thread.

[中文说明](./README.zh-CN.md)

## Why This Exists

Most AI-assisted repos start the same way:

- rules are scattered across prompts, chats, and personal notes
- architecture context is missing or stale
- multi-step work has no durable execution record
- each new agent session has to rediscover the project from scratch

`harness-engineer` solves that by generating a lightweight documentation harness directly in the repository:

- `HARNESS_BOOTSTRAP.md` as the orchestrator activation protocol and runtime entry point
- `AGENTS.override.md` as the Codex collaboration guide and bootstrap trigger
- `.codex/config.toml` and `.codex/agents/*.toml` for project-scoped subagents
- `ARCHITECTURE.md` for system boundaries and change impact
- `docs/` for product, design, security, reliability, references, and execution plans
- `harness-engineer.config.json` so future commands can understand the scaffolded repo

## Key Innovation: Runtime Activation

Unlike typical scaffolding tools, `harness-engineer` provides a **runtime activation layer**:

- `HARNESS_BOOTSTRAP.md` defines the first-turn protocol for Codex
- Orchestrator mode is enforced through task classification and delegation rules
- `harness start` provides a standardized activation prompt instead of manual entry
- The repository now boots Codex into a predictable, coordination-first mode

## Highlights

- Supports both empty projects and existing repositories
- Generates a consistent harness baseline with real files, not hardcoded string blobs
- Adds a dedicated `harness enrich` flow that runs `codex exec` against an existing repo
- Provides `harness start` for reliable orchestrator mode activation
- Supports `en`, `zh`, and `bilingual` output modes
- Tracks managed-file drift with `harness status`
- Creates and archives durable execution plans with `harness task`

## Requirements

- Node.js `>= 20`
- npm, pnpm, or another package manager that can install the package
- For `harness enrich`: a working local Codex CLI with a valid login

## Installation

Install the package globally:

```bash
npm install -g harness-engineer
```

This publishes a single executable on your PATH:

```bash
harness --version
```

If `harness` is not found after install, make sure your npm global bin directory is on PATH.

## Getting Started

### 1. Initialize a new project

```bash
mkdir acme-platform
cd acme-platform
harness init . --project-name "Acme Platform" --yes
```

### 2. Start working with Codex in harness mode

```bash
harness start
```

Copy the output from `harness start` and paste it as your first prompt when opening a new Codex session. This activates orchestrator mode with proper delegation rules.

### 3. Enrich an existing repository

```bash
cd existing-repo
harness enrich . --yes
```

This will:

1. add any missing harness baseline files
2. create or refresh `HARNESS_BOOTSTRAP.md` for runtime activation
3. keep existing app code untouched
4. invoke `codex exec` to enrich the generated docs using repository evidence

After enrichment, run `harness start` to get your activation prompt.

### 4. Create and track an execution plan

```bash
harness task new 2026-04-02-auth-debug --class B
harness status
```

## Scaffold Overview

The default `generic-software` preset creates a structure like this:

```text
.
├── HARNESS_BOOTSTRAP.md          ← Runtime activation protocol
├── AGENTS.override.md
├── ARCHITECTURE.md
├── harness-engineer.config.json
├── .codex/
│   ├── config.toml
│   └── agents/
│       ├── orchestrator.toml
│       ├── planner.toml
│       ├── builder.toml
│       ├── reviewer.toml
│       └── tester.toml
└── docs/
    ├── index.md
    ├── DESIGN.md
    ├── FRONTEND.md
    ├── PLANS.md
    ├── PRODUCT_SENSE.md
    ├── QUALITY_SCORE.md
    ├── RELIABILITY.md
    ├── SECURITY.md
    ├── design-docs/
    ├── exec-plans/
    ├── generated/
    ├── product-specs/
    └── references/
```

## CLI Reference

### `harness start`

Generate a standardized activation prompt for Codex in harness mode.

```bash
harness start
```

This command checks the repository status and outputs a bootstrap prompt that:

- Instructs Codex to read `HARNESS_BOOTSTRAP.md` first
- Defines the orchestrator role and delegation rules
- Shows active execution plans and missing managed files
- Provides a quick reference for task routing

**Use this output as your first prompt when opening a new Codex session.**

### `harness init`

Bootstrap the harness baseline in a new or not-yet-scaffolded directory.

```bash
harness init [target-directory] \
  [--project-name <name>] \
  [--preset generic-software] \
  [--language en|zh|bilingual] \
  [--force] \
  [--yes] \
  [--dry-run]
```

Notes:

- `target-directory` defaults to `.`
- `--project-name` is inferred from the directory when omitted
- `--yes` skips the non-empty directory confirmation
- `--force` refreshes managed harness files
- `--dry-run` previews the scaffold plan without writing files

### `harness enrich`

Add missing harness files to an existing repo, then run Codex to fill in project background docs.

```bash
harness enrich [target-directory] \
  [--project-name <name>] \
  [--preset generic-software] \
  [--language en|zh|bilingual] \
  [--force] \
  [--yes] \
  [--dry-run]
```

Notes:

- designed for existing repositories, not empty directories
- only managed harness docs are created or refreshed before Codex runs
- application code, dependencies, CI, and lockfiles are not touched by the enrich flow
- `--dry-run` skips both file writes and the Codex invocation

### `harness task new`

Create an execution plan from `docs/exec-plans/template.md`.

```bash
harness task new <slug> --class A|B|C
```

### `harness task archive`

Move an active plan to `docs/exec-plans/completed/` and append completion sections if needed.

```bash
harness task archive <slug>
```

### `harness status`

Report the health of the scaffolded repo.

```bash
harness status
```

It checks:

- active plans
- missing managed files
- drifted managed files
- execution plans missing required sections

## Activating Harness Mode

To get Codex operating in harness orchestrator mode:

1. **After initialization or enrichment:**
   ```bash
   harness start
   ```

2. **Copy the output** and paste it as your first prompt in Codex.

3. **Codex will then:**
   - Read `HARNESS_BOOTSTRAP.md` to understand its role
   - Follow the first-turn protocol for task classification and delegation
   - Operate as orchestrator rather than general-purpose assistant

4. **Reopen the repo?** Run `harness start` again for a fresh activation prompt.

This standardized activation ensures consistent behavior across sessions without maintaining manual prompt templates.

## Language Modes

`harness-engineer` supports three language modes:

- `en`: generates English docs
- `zh`: generates Chinese docs
- `bilingual`: generates English and Chinese content in the same markdown files

This applies to both `init` and `enrich`, and also to execution-plan templates used by `harness task`.

## How `enrich` works

`harness enrich` is intentionally conservative and runtime-aware.

Before Codex is invoked, the CLI prepares the repo with the managed baseline. Then it runs a scoped `codex exec` prompt that is instructed to:

- enable orchestrator mode activation via `HARNESS_BOOTSTRAP.md`
- stay inside the harness-managed documentation set
- recover context from the repo itself
- avoid modifying source code, dependencies, lockfiles, or CI
- mark unknowns explicitly instead of inventing details

The enrichment process ensures that:

1. `HARNESS_BOOTSTRAP.md` contains task classification and delegation rules
2. `AGENTS.override.md` references `HARNESS_BOOTSTRAP.md` first in the read order
3. Orchestrator role is clearly distinguished from implementation roles
4. The repository is ready for `harness start` activation

That makes it suitable for retrofitting an existing codebase without turning the command into a code-modifying migration tool.

## Collaboration Roles

The default scaffold documents five collaboration roles:

- Orchestrator
- Planner
- Builder
- Reviewer
- Tester

Those roles appear both in the generated docs and in project-scoped Codex custom agents under `.codex/agents/`, so explicit subagent delegation can reuse the same vocabulary as the repo docs.

## Example Repository Workflow

```bash
# initialize a new repo
harness init . --project-name "Acme Platform" --language bilingual --yes

# get the activation prompt and start Codex
harness start
# (copy and paste the output as your first Codex prompt)

# create a tracked task
harness task new 2026-04-02-onboarding-flow --class B

# later, audit the scaffold health
harness status

# or enrich an existing repository
harness enrich . --yes
harness start  # always use harness start when reopening the repo in Codex
```

## Official References

If you want to go deeper on the underlying Codex workflows this project is built around, these official OpenAI resources are the most relevant starting points:

- [Codex CLI](https://developers.openai.com/codex/cli) for the command-line runtime model behind `harness enrich`
- [Codex Subagents](https://developers.openai.com/codex/subagents) for project-scoped custom agent roles and delegation patterns
- [Codex Prompting Guide](https://developers.openai.com/codex/prompting) for writing stronger repository-aware instructions and prompts
- [OpenAI Developers Resources](https://developers.openai.com/resources) for newer Codex cookbooks, guides, and workflow articles

## Troubleshooting

### `harness: command not found`

Your npm global bin directory is probably not on PATH. Re-open the shell or add the npm global bin path to your shell profile.

### `harness enrich` says Codex is missing

Install the Codex CLI and authenticate it first:

```bash
codex login
```

Then rerun:

```bash
harness enrich . --yes
```

### The repo already contains custom docs

That is expected. By default, managed files are only created when missing. Use `--force` only when you explicitly want to refresh the harness-managed baseline.

## Development

```bash
pnpm install
pnpm check
pnpm test:coverage
pnpm build
```

Useful release check:

```bash
pnpm release:check
```

## Published Package

The published package includes:

- compiled runtime files from `dist/`
- scaffold templates from `templates/`
- package docs such as `README.md`, `README.zh-CN.md`, and `CHANGELOG.md`

## Contributing

Contributions are welcome. If you want to improve the scaffold shape, command UX, template quality, or documentation flow, start with [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Released under the [MIT](./LICENSE) license.

## Community / Project Activity

If this project is useful in your workflow, starring the repository is a simple way to support it and follow its progress over time.

| Signal | Activity |
| --- | --- |
| GitHub star history | [![Star History Chart](https://api.star-history.com/svg?repos=Dai5297/harness-engineer-codex&type=Date)](https://www.star-history.com/#Dai5297/harness-engineer-codex&Date) |
