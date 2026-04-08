# Product Sense

## Primary users

- Maintainers starting a new repository who want a durable AI collaboration baseline in one command
- Maintainers retrofitting an existing repository with file-first Codex docs without changing application code
- Teams that want lightweight execution-plan tracking and managed-file drift checks around those docs

## Core user jobs

- `init`: create a predictable harness baseline with docs, `.codex/` agent config, and `harness-engineer.config.json`
- `enrich`: scaffold missing harness files into an existing repo, then ask Codex to fill in repo-specific background docs
- `task`: create and archive durable execution plans
- `status`: audit missing or drifted managed files and malformed active plans

## Product boundaries

- This package is not a general application scaffold.
- It is not a code migration tool.
- It is not a CI system or release orchestrator.
- It does not infer deep repository knowledge by itself; `enrich` delegates that job to a local Codex CLI invocation using a constrained prompt.

## Stable vocabulary worth preserving

- `harness`: the repository-owned collaboration and documentation layer
- `preset`: the source of managed file paths, roles, and template context
- `managed files`: files listed in `harness-engineer.config.json` and rendered from template content
- `execution plan`: a tracked markdown file under `docs/exec-plans/`
- `workspace kind`: `empty`, `existing`, or `scaffolded`

## Current product tensions

- `status` compares current files to template output, which is good for baseline drift but can mark repo-authored enrichment as drift.
- `enrich` is intentionally conservative in prompt scope, but it still depends on the behavior of an external Codex CLI.
- Supporting `en`, `zh`, and `bilingual` modes improves adoption but increases template parity work.
- Task class values exist in the CLI contract, but their intended planning semantics are not documented in code or docs yet.
