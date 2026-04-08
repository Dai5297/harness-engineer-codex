# Design Notes

## What users actually experience

This package does not present a graphical app. Its designed surfaces are:

- CLI command help, summaries, and confirmation prompts
- Generated markdown files written into downstream repositories
- Published package docs in `README.md` and `README.zh-CN.md`

## Repo-specific design rules

- Keep the product file-first. The package exists to create durable repo documents, not to move context back into prompts.
- Keep scaffold content on disk. The repo deliberately ships real template files under `templates/` instead of burying long markdown blobs inside TypeScript.
- Preserve shared vocabulary across code and docs. Role names, managed path names, and command nouns should match between README, templates, `harness-engineer.config.json`, and `src/`.
- Treat `bilingual` output as a first-class mode. `src/core/template-language.ts` composes a full English block followed by a full Chinese block; it is not a partial translation fallback.
- Preserve user repositories by default. `harness enrich` is intentionally constrained to harness-managed docs, and `init`/`enrich` default to create-missing behavior unless `--force` is used.

## When design work is really template work

- If a heading, filename, or section changes in generated docs, that is a product-design change because downstream users and `harness status` observe it.
- If CLI output changes, review both the command handlers and the README because user expectations are set in both places.
- If English template content changes, inspect the localized `zh` file before closing the task.

## Design review prompts for this repo

- Does the new copy help a maintainer understand what the command will and will not touch?
- Does the change preserve the distinction between scaffold baseline, enriched repo docs, and generated artifacts?
- Does the change keep the generated repo structure legible for future Codex sessions?
- Does the change introduce drift between README, templates, and tested CLI behavior?

## Open question

There is still no dedicated design doc for the biggest UX tradeoff in the package: `status` measures drift from the scaffold baseline even after repositories author richer docs. If that behavior changes, capture the rationale in `docs/design-docs/`.
