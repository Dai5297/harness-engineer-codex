# Changelog

## 0.2.2

- renamed the published CLI binary to `harness` while keeping the npm package name `harness-engineer`
- added `harness enrich` with local `codex exec` orchestration for existing repositories
- added real `zh` and `bilingual` document generation, including bilingual execution plan support
- removed tracked smoke-test output under `tmp/` and now ignore future temp scaffolds

## 0.2.1

- clarified that `harness-engineer init` bootstraps the full repository-owned Codex baseline in one command
- updated generated prompts and documentation to tell Codex to reuse the scaffolded subagents, config, memory, runbooks, and docs before inventing ad hoc setup

## 0.2.0

- aligned the default `generic-software` preset with OpenAI's harness engineering article
- switched the Codex entrypoint from generated `AGENTS.md` to generated `AGENTS.override.md`
- reorganized generated repository docs around `design-docs`, `product-specs`, `generated`, `references`, and `exec-plans`
- removed the old `agentadmin-codex` compatibility preset to keep the package repository-independent
- updated package metadata for published consumers, including `main`, `types`, and `exports`

## 0.1.0

- initial public release of the `harness-engineer` npm package
