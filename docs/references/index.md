# References

## Current durable anchors already referenced by this repo

- `README.md` links to the official OpenAI docs for Codex CLI, Codex Subagents, Codex Prompting Guide, and the broader OpenAI developer resources.
- `CONTRIBUTING.md` and `OPEN_SOURCE_RELEASE_CHECKLIST.md` are the local operator references for development and release steps.
- `package.json`, `tsconfig.json`, `tsconfig.build.json`, and `vitest.config.ts` are the local references for runtime/tooling versions and validation thresholds.

## Good candidates for this directory

- Short vendor notes that repeatedly affect template or enrich behavior
- Compatibility notes for Node, Codex, TypeScript, or Vitest changes that materially affect the CLI
- Release or publishing references that are too detailed for the README

## Rules

- Keep references dated and scoped to durable decisions.
- Prefer linking back to README or source files already in the repo when they are the true source of truth.
- Summarize the part that matters to this package instead of pasting large external documents.
