# {{projectName}} Codex Collaboration Guide

Preferred collaboration language: `{{languageDisplay}}`

## Purpose

This repository uses file-first harness engineering. Agents should recover context from repository documents before relying on chat history or ad hoc prompts.

## Root session policy

The root Codex session is orchestration-only.

1. Read repository context and decide delegation order.
2. Use subagents for planning, implementation, review, and validation work.
3. Do not write repository files or implement code directly from the root session.
4. If no suitable write-capable subagent is available, stop and report the blocker instead of implementing in the root session.

## Read first

1. `.codex/config.toml`
2. The relevant `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. `docs/index.md`
5. The active execution plan, if one exists
6. Only then the code and tests

## Default roles

{{#list roleSummaries}}

## Ownership notes

{{#list roleOwnership}}

## Expected outputs

{{#list roleOutputs}}

## Shared operating sequence

{{#list collaborationSequence}}

## Repository sources of truth

{{#list documentationAreas}}

## Codex subagents

{{#list subagentUsage}}

Project-scoped agent files:

{{#list subagentPaths}}

## Working agreements

1. Start by delegating to the smallest suitable subagent; do not let the root session become the implementation agent.
2. Update `ARCHITECTURE.md`, specs, or plans in the same change when behavior or constraints move.
3. Treat `docs/generated/` as local evidence, not as a place for hand-written guesses.
4. Keep review findings and validation results explicit; do not hide risk in narrative prose.
5. If a task spans multiple turns, open or update an execution plan before implementation drifts.
