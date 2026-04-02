# Override Only Project Codex Collaboration Guide

Preferred collaboration language: `en`

## Purpose

This repository uses file-first harness engineering. Agents should recover context from repository documents before relying on chat history or ad hoc prompts.

## Read first

1. `.codex/config.toml`
2. The relevant `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. `docs/index.md`
5. The active execution plan, if one exists
6. Only then the code and tests

## Default roles

- `Orchestrator` is responsible for own task framing, document lookup order, delegation boundaries, and closure criteria.
- `Planner` is responsible for turn goals into phased execution plans, identify dependencies, and surface hidden risk early.
- `Builder` is responsible for implement the smallest correct change, keep documents in sync, and avoid speculative rewrites.
- `Reviewer` is responsible for look for regressions, document drift, risky assumptions, and correctness gaps before work is called done.
- `Tester` is responsible for define and execute the validation matrix, then report exactly what is verified and what is still unknown.

## Ownership notes

- `Orchestrator`: Task intake, scope framing, and decision logging; Choosing which documents and plans need updates; Handing work across Planner, Builder, Reviewer, and Tester
- `Planner`: Breaking large work into incremental steps; Finding cross-document and cross-module dependencies; Defining validation and rollout sequencing
- `Builder`: Code changes and low-risk refactors; Updating architecture or product docs when behavior changes; Capturing assumptions that the next role must verify
- `Reviewer`: Findings-first review of behavioral risk; Checking whether docs still match the implementation; Surfacing residual risk and unverified paths
- `Tester`: Unit, integration, and workflow validation planning; Evidence capture for manual and automated checks; Clear verified versus unverified reporting

## Expected outputs

- `Orchestrator`: Clear task statement with guardrails; Document update checklist; Decision summary and next-step owner
- `Planner`: Execution plan with milestones; Risk register and open questions; Recommended document updates before coding starts
- `Builder`: Implementation summary; Changed files and affected boundaries; Notes for Reviewer and Tester
- `Reviewer`: Prioritized findings; Drift or omission callouts; Residual risk summary
- `Tester`: Validation matrix; Executed checks with results; Outstanding test gaps and release blockers

## Shared operating sequence

- Read `AGENTS.override.md`, `ARCHITECTURE.md`, and `docs/index.md` before planning implementation details.
- Use `docs/exec-plans/active/` for any task that spans multiple decisions, roles, or review rounds.
- Update repository-owned documents in the same change whenever contracts, behavior, or constraints move.
- Keep Reviewer and Tester independent from Builder when validating risky changes.
- Record what is verified, what is assumed, and what still needs follow-up before closing work.

## Repository sources of truth

- `AGENTS.override.md` for collaboration rules, role boundaries, and document lookup order.
- `ARCHITECTURE.md` for the system map, major modules, and boundary rules.
- `docs/design-docs/` for technical rationale, decision records, and cross-cutting design tradeoffs.
- `docs/product-specs/` for user-facing behavior, flows, and acceptance criteria.
- `docs/exec-plans/` for active and completed multi-step work.
- `docs/generated/` for local artifacts that agents should reference instead of re-deriving.
- `docs/references/` for durable external knowledge, glossary items, and important links.

## Codex subagents

- Project-scoped custom agents live under `.codex/agents/` and are meant for explicit subagent delegation.
- Use `.codex/config.toml` to keep `[agents]` runtime settings like `max_threads` and `max_depth` with the repo.
- Keep each custom agent narrow, opinionated, and aligned to one main responsibility.
- Prefer read-only agents for planning and review; use write-capable agents only when implementation is the goal.

Project-scoped agent files:

- `.codex/agents/orchestrator.toml`
- `.codex/agents/planner.toml`
- `.codex/agents/builder.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/tester.toml`

## Working agreements

1. Start with the smallest document or code change that makes the task clearer.
2. Update `ARCHITECTURE.md`, specs, or plans in the same change when behavior or constraints move.
3. Treat `docs/generated/` as local evidence, not as a place for hand-written guesses.
4. Keep review findings and validation results explicit; do not hide risk in narrative prose.
5. If a task spans multiple turns, open or update an execution plan before implementation drifts.
