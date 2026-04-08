# Harness Engineer Codex Architecture

## System intent

`harness-engineer` is a local Node.js CLI and small library for bootstrapping repository-owned AI collaboration context. Its stable contract is: scaffold predictable docs and Codex agent files into a repository, enrich those docs via a constrained Codex run, and help maintainers track plan hygiene and template drift without modifying application code outside the allowed harness surface.

## Runtime shape

- Execution model: local Node.js `>=20` CLI distributed as the `harness` binary from `package.json`.
- State model: filesystem-first. Durable state lives in generated markdown, `.codex/*`, and `harness-engineer.config.json`.
- External process boundary: `harness enrich` is the only workflow that requires another tool, a locally installed Codex CLI.
- Absent subsystems: this repo has no server runtime, database layer, HTTP client, or browser application.

## Module boundaries

- CLI entry and dispatch: `src/cli.ts`, `src/cli/run.ts`
- CLI parsing and process I/O: `src/cli/args.ts`, `src/cli/io.ts`
- Command adapters: `src/commands/init-command.ts`, `src/commands/enrich-command.ts`, `src/commands/status-command.ts`, `src/commands/task-command.ts`
- Core services: `src/core/*`
- Preset and template data: `src/presets/generic-software.ts`, `templates/generic-software/`, `templates/_locales/generic-software/zh/`
- Public library surface: `src/index.ts` plus thin re-export files such as `src/init.ts`, `src/enrich.ts`, and `src/status.ts`
- Validation surface: `tests/unit/*` for helper/service behavior and `tests/integration/*` for end-user workflows

## Command flow map

- `init`: inspect target directory, build harness config, render managed templates, add the package to `devDependencies`, then write the scaffolded files.
- `enrich`: inspect workspace kind, scaffold only missing managed files, check Codex availability, then run `codex exec` with the repo-specific enrichment prompt.
- `status`: load the harness config, re-render expected template output, compare managed files by exact content equality, and check active plan headings.
- `task new` and `task archive`: render or update markdown execution plans under `docs/exec-plans/`.

## Key data contracts

- `HarnessConfig` is the persisted repo contract: project name, preset key, language mode, managed paths, roles, and managed file list.
- `PresetDefinition` is the source of scaffold paths, role defaults, and template context. Only `generic-software` is registered today.
- Template rendering supports only scalar placeholders like `{{projectName}}` and list placeholders like `{{#list roleSummaries}}`.
- Language modes are `en`, `zh`, and `bilingual`; bilingual output is composed as a full English block followed by a full Chinese block.

## Important technical constraints

- `workspace-service` refuses `enrich` on empty directories and on non-empty directories that do not look like real projects.
- `task-service` limits task slugs to `^[a-z0-9][a-z0-9-]*$` and only accepts task classes `A`, `B`, or `C`.
- `status-service` treats freshly rendered template output as the baseline. Any repo-authored change to a managed file can register as drift.
- `codex-runner` launches `codex exec -C <cwd> --skip-git-repo-check --full-auto -o <tempfile>` via `child_process.spawn`, not shell string interpolation.
- The package currently has no runtime dependencies; `package.json` lists only devDependencies for TypeScript and Vitest tooling.
- `docs/generated/db-schema.md` is scaffold filler from the generic template. No code in this repo generates or consumes database schema state.

## Repo-specific drift and open questions

- As of the local `2026-04-02` verification run, `node dist/cli.js status` reports `16` drifted managed files. The drift spans the repo-local `.codex` files and most repo-authored harness docs because `status` compares against the generic template baseline rather than against repo-enriched context.
- `CHANGELOG.md` and the template files say generated repos should default the root Codex session to read-only and make builder/tester explicitly write-capable. The local repo config does not currently enforce that generated baseline.
- There are no repo-specific design docs or product specs checked in yet; deeper rationale still lives mainly in code, tests, README, and changelog.

## Change checklist

- Which boundary is moving: CLI UX, core service logic, template content, or public package docs?
- Which tests must move with it: unit helpers, integration workflows, or both?
- Which downstream contract is affected: generated file content, command behavior, status semantics, or Codex invocation?
- Which repo-owned document becomes stale if the change lands?
