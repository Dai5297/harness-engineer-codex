# Harness Engineer Codex Collaboration Guide

Preferred collaboration language: `English`

## Purpose

This repository is the source for the `harness-engineer` npm CLI. The product exists to turn transient AI collaboration context into durable repository files: `AGENTS.override.md`, `.codex/*`, `ARCHITECTURE.md`, and the `docs/` tree. Future Codex sessions should recover project context from those files first because that is the workflow this package is designed to produce for downstream repositories.

## What this repo owns

- `src/` implements the published CLI and library surface.
- `templates/generic-software/` is the shipped English scaffold baseline.
- `templates/_locales/generic-software/zh/` contains localized Chinese template overrides.
- `tests/` covers init, enrich, task, status, preset, renderer, and Codex runner behavior.
- `README.md` and `README.zh-CN.md` are part of the public package contract.
- `dist/` and `coverage/` are generated outputs, not primary sources of truth.

## Read first

1. `.codex/config.toml`
2. The relevant `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. `docs/index.md`
5. `README.md`
6. `harness-engineer.config.json`
7. The active execution plan, if one exists
8. Only then the code and tests

## Default operating model

- Treat the root session as the Orchestrator by default: establish scope, identify the owning surface, and then work in the smallest boundary that can answer the question.
- For CLI behavior, read `src/cli/`, `src/commands/`, and the corresponding integration tests before editing copy or flows.
- For scaffold content, inspect the matching file under `templates/generic-software/` and, when relevant, the `zh` localized override before changing code.
- For repo-documentation changes, update the docs alongside the affected behavior instead of leaving the templates or README to drift.
- Do not infer a browser app, database, or network service from scaffold placeholders such as `docs/generated/db-schema.md`; this repo does not implement those subsystems.

## Default roles

- `Orchestrator`: Own task framing, document lookup order, delegation boundaries, and closure criteria.
- `Planner`: Turn goals into phased execution plans, identify dependencies, and surface hidden risk early.
- `Builder`: Implement the smallest correct change, keep documents in sync, and avoid speculative rewrites.
- `Reviewer`: Look for regressions, document drift, risky assumptions, and correctness gaps before work is called done.
- `Tester`: Define and execute the validation matrix, then report exactly what is verified and what is still unknown.

## Role boundaries

- `Orchestrator`: Scope the task, decide which repo surface is authoritative, and identify which docs must move with the change.
- `Planner`: Break work into steps across `src/`, `templates/`, README, and repo docs when the behavior crosses those boundaries.
- `Builder`: Change implementation or template files and call out the follow-up checks needed in integration tests and package docs.
- `Reviewer`: Focus on behavior regressions, template drift, and mismatches between code, README, and harness docs.
- `Tester`: Confirm CLI, template, and status/task behavior with the smallest useful matrix of unit, integration, and local workflow checks.

## Route by task

- Command parsing, usage text, and interactive prompts: `src/cli/`, `src/commands/`
- Filesystem scaffolding and manifest writes: `src/core/scaffold-service.ts`, `src/core/scaffold-writer.ts`, `src/core/config-service.ts`
- Template resolution, localization, and rendering: `src/core/template-loader.ts`, `src/core/template-language.ts`, `src/presets/generic-software.ts`, `templates/`
- Workspace inspection, status, and task lifecycle: `src/core/workspace-service.ts`, `src/core/status-service.ts`, `src/core/task-service.ts`
- Codex enrichment flow: `src/core/enrich-service.ts`, `src/core/enrich-prompt.ts`, `src/core/codex-runner.ts`
- Published package contract: `package.json`, `README.md`, `README.zh-CN.md`, `CHANGELOG.md`

## Codex usage in this repo

- Project-scoped agent TOMLs exist for `orchestrator`, `planner`, `builder`, `reviewer`, and `tester`.
- The repo-local `.codex/config.toml` currently sets only `[agents].max_threads` and `[agents].max_depth`.
- The shipped scaffold templates and `CHANGELOG.md` describe a stricter generated policy: root session read-only, with explicit `workspace-write` on builder and tester agents.
- Because the local `.codex` files currently differ from that shipped baseline, inspect the TOMLs themselves instead of assuming the generated-template policy is enforced in this repository.

Project-scoped agent files:

- `.codex/agents/orchestrator.toml`
- `.codex/agents/planner.toml`
- `.codex/agents/builder.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/tester.toml`

## Working agreements

1. Keep claims anchored to code, tests, templates, package metadata, or existing repo docs.
2. When command behavior changes, update the matching README, template files, and repo-owned harness docs in the same change.
3. When a template file changes, check whether the localized `zh` variant also needs to move.
4. Treat `harness status` as a template-baseline checker, not as proof that repo-authored documentation is wrong.
5. Open or refresh an execution plan for work that spans multiple decisions, but leave the shared plan templates generic.
