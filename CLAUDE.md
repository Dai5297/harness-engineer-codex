# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`harness-engineer` is a Node.js CLI that scaffolds repository-owned documentation for AI agent collaboration. It generates a consistent harness of docs, agent configs, and execution plans directly into repositories.

## Development Commands

```bash
pnpm install           # Install dependencies
pnpm typecheck         # Type check without emit
pnpm test              # Run tests with vitest
pnpm test:coverage     # Run tests with coverage (80% threshold required)
pnpm check             # typecheck + test combined
pnpm build             # Compile TypeScript to dist/
pnpm release:check     # Full pre-release validation (check + coverage + build + pack)
```

Run a single test file:
```bash
pnpm vitest run tests/unit/render.test.ts
```

## Architecture

### Source Structure

- `src/cli.ts` - CLI entry point (bin: `dist/cli.js`)
- `src/cli/` - CLI parsing, IO handling, and command routing
- `src/commands/` - Command implementations (init, enrich, status, task)
- `src/core/` - Core services:
  - `scaffold-service.ts` - File system scaffolding
  - `config-service.ts` - `harness-engineer.config.json` management
  - `template-loader.ts` - Template resolution with locale support
  - `workspace-service.ts` - Project inspection (empty/existing/scaffolded)
  - `status-service.ts` - Template drift detection
  - `enrich-service.ts` - Codex CLI integration
  - `codex-runner.ts` - External Codex process spawning
- `src/presets/` - Preset definitions (currently only `generic-software`)
- `templates/` - Scaffold templates organized by preset and locale

### Key Patterns

**Preset System**: Presets define paths, roles, and template context. The `generic-software` preset is the default. Adding new presets requires a `PresetDefinition` in `src/presets/` and corresponding template directory.

**Template Rendering**: Templates use `{{placeholder}}` syntax for scalars and `{{#list}}...{{/list}}` for sections. The `renderTemplate` function in `src/render.ts` handles substitution.

**Localization**: Templates exist in `templates/generic-software/` (English) and `templates/_locales/generic-software/zh/` (Chinese). The `--language` flag supports `en`, `zh`, and `bilingual`.

**Role-Based Agents**: Five collaboration roles (Orchestrator, Planner, Builder, Reviewer, Tester) are defined in presets and used to generate `.codex/agents/*.toml` files.

### CLI Commands

- `harness init` - Bootstrap new project with harness docs
- `harness enrich` - Add missing harness files + invoke Codex CLI
- `harness status` - Check scaffold health (drift, missing files)
- `harness task new/archive` - Manage execution plans in `docs/exec-plans/`

## Technical Constraints

- **Node.js >=20** required
- **No runtime dependencies** - only devDependencies
- **Read-only by default** - root session is orchestration-only; Builder/Tester roles are write-capable
- **Codex CLI required for enrich** - `harness enrich` spawns external `codex exec` process
- **Task slugs**: must match `^[a-z0-9][a-z0-9-]*$`
- **Workspace validation**: `enrich` refuses empty directories or non-project directories

## Project Rules (from CONTRIBUTING.md)

- Keep the package Codex-focused
- Avoid machine-local absolute paths in generated templates
- Keep presets manifest-driven (no hardcoded special cases)
- Do not commit `node_modules/`, `dist/`, `coverage/`
