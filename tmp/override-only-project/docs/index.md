# Override Only Project Documentation Index

Use this file as the repository map for humans and agents.

## Core documents

- `AGENTS.override.md` for collaboration rules, role boundaries, and document lookup order.
- `ARCHITECTURE.md` for the system map, major modules, and boundary rules.
- `docs/design-docs/` for technical rationale, decision records, and cross-cutting design tradeoffs.
- `docs/product-specs/` for user-facing behavior, flows, and acceptance criteria.
- `docs/exec-plans/` for active and completed multi-step work.
- `docs/generated/` for local artifacts that agents should reference instead of re-deriving.
- `docs/references/` for durable external knowledge, glossary items, and important links.

- `AGENTS.override.md` as the Codex bootstrap entrypoint and collaboration guide
- `.codex/config.toml` for repo-level subagent runtime settings
- `.codex/agents/*.toml` for project-scoped custom agents used in explicit subagent workflows

## Recommended read order

1. `AGENTS.override.md`
2. `.codex/config.toml` and the relevant `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. The most relevant document under `docs/`
5. The active execution plan, if one exists
6. Only then the code and tests

## Documentation rules

- Prefer adding one sharp document over bloating `AGENTS.override.md`.
- Keep every document opinionated enough to guide a real decision.
- If a document is stale, either update it or call out the drift explicitly.
- Generated artifacts belong in `docs/generated/`, not in hand-written design docs.
