# {{projectName}} Codex Collaboration Guide

Preferred collaboration language: `{{languageDisplay}}`

> **BOOTSTRAP NOTICE**: You are operating in a harness-engineered repository. Read this file and `HARNESS_BOOTSTRAP.md` before taking any action. The root session is orchestration-only.

## Purpose

This repository uses file-first harness engineering. Agents should recover context from repository documents before relying on chat history or ad hoc prompts.

---

## Bootstrap Protocol

### Activation Sequence

Before responding to any request, complete this sequence:

1. **Read context files** (in order):
   - `HARNESS_BOOTSTRAP.md` — activation protocol and delegation rules
   - `.codex/config.toml` — subagent limits
   - The relevant `.codex/agents/*.toml` — role capabilities
   - `ARCHITECTURE.md` — system boundaries
   - `docs/index.md` — documentation routing
   - Active execution plans — any in-progress work

2. **Classify the request**:
   - **explain**: Direct response allowed
   - **analyze**: May delegate to `planner` or `reviewer`
   - **plan**: Delegate to `planner`
   - **implement**: Delegate to `builder`
   - **debug**: Sequential delegation: `planner` → `builder` → `tester`
   - **review**: Delegate to `reviewer`
   - **verify**: Delegate to `tester`

3. **Assess complexity**:
   - **trivial**: Single file, <10 lines, no architecture impact → May handle directly
   - **moderate**: Multi-file, clear scope, low risk → Single subagent delegation
   - **complex**: Cross-module, unclear boundaries, high risk → Execution plan + multi-role

4. **Choose strategy and delegate** or handle directly (only for trivial/explain tasks).

### Delegation Triggers

**MUST delegate when:**
- Request involves new feature development
- Request requires multi-file modifications
- Request affects architecture or API contracts
- Request has security implications
- Request involves unfamiliar code domains
- Request has high rollback cost

**MAY handle directly when:**
- Pure explanation or clarification
- Single-file minor fix (<10 lines)
- Documentation-only update
- Simple configuration change
- Directing to existing files/documents

---

## Root Session Policy

The root Codex session is **orchestration-only**.

1. Read repository context and decide delegation order.
2. Use subagents for planning, implementation, review, and validation work.
3. Do not write repository files or implement code directly from the root session.
4. If no suitable write-capable subagent is available, stop and report the blocker instead of implementing in the root session.

**Negative Rules:**
- Do not skip reading context files before proposing work
- Do not accept vague task statements without clarification
- Do not claim work is "done" without validation for complex changes
- Do not start implementation without checking for existing execution plans
- Do not delegate to multiple write-capable agents simultaneously

---

## Default Roles

{{#list roleSummaries}}

## Ownership Notes

{{#list roleOwnership}}

## Expected Outputs

{{#list roleOutputs}}

---

## Role Trigger Rules

### Call `planner` when:
- Task needs decomposition into phases
- Dependencies between steps are unclear
- Risk assessment is needed before implementation

### Call `builder` when:
- Scope is clear and bounded
- Implementation path is well-defined
- Code changes are required

### Call `reviewer` when:
- Implementation is complete
- Checking for regressions or documentation drift
- Identifying residual risk

### Call `tester` when:
- Validation matrix is needed
- Tests should be run/verified
- Coverage gaps need identification

---

## Shared Operating Sequence

{{#list collaborationSequence}}

## Repository Sources of Truth

{{#list documentationAreas}}

## Codex Subagents

{{#list subagentUsage}}

Project-scoped agent files:

{{#list subagentPaths}}

---

## Working Agreements

1. Start by delegating to the smallest suitable subagent; do not let the root session become the implementation agent.
2. Update `ARCHITECTURE.md`, specs, or plans in the same change when behavior or constraints move.
3. Treat `docs/generated/` as local evidence, not as a place for hand-written guesses.
4. Keep review findings and validation results explicit; do not hide risk in narrative prose.
5. If a task spans multiple turns, open or update an execution plan before implementation drifts.

---

## Quick Reference

| Task Type | Complexity | Action |
|-----------|------------|--------|
| explain | any | Direct response |
| trivial (non-explain) | trivial | Handle directly |
| implement/debug | moderate | Single subagent |
| any | complex | Plan + multi-role delegation |
