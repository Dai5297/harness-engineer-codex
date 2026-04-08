# Security Notes

## Trust boundaries in this repo

This package runs locally and primarily reads and writes files. The important trust boundaries are:

- CLI arguments and target paths supplied by the user
- Existing local repo files such as `package.json` and `harness-engineer.config.json`
- Environment variables such as `HARNESS_CODEX_BIN`
- The external `codex` binary launched during `harness enrich`

## Current controls backed by code

- `parseHarnessLanguage` and `parseTaskClass` validate supported enum values.
- `assertValidTaskSlug` restricts plan file names to lowercase letters, numbers, and hyphens.
- `inspectTargetDirectory` rejects non-directory targets and blocks `enrich` on empty or obviously non-project directories.
- `codex-runner` uses `child_process.spawn(command, args)` rather than shell string interpolation.
- Filesystem writes go through `writeTextFile`, which creates parent directories explicitly and normalizes trailing newlines.
- The inspected source tree contains no obvious hardcoded secrets or credentials outside documentation/checklist text.

## Repo-specific risks

- `enrich` runs `codex exec --full-auto`, so downstream write safety depends partly on local Codex configuration and prompt compliance.
- `resolveCodexCommand` trusts either an explicit override or `HARNESS_CODEX_BIN`; a malicious or unexpected binary at that path would be executed.
- `loadHarnessConfig` and `readJsonFile` trust local JSON files and will throw on malformed data rather than repairing them.
- `--force` intentionally overwrites managed files. That is valid product behavior, but it is also the sharpest local write surface.

## Changes that deserve explicit security review

- Anything under `src/core/codex-runner.ts` or `src/core/enrich-service.ts`
- Filesystem write behavior in `src/core/scaffold-writer.ts` or `src/utils/fs.ts`
- Target directory detection in `src/core/workspace-service.ts`
- New environment variables, new subprocesses, or new networked dependencies

## Open questions

- The repo ships template instructions and changelog guidance about root-session read-only delegation, but the repo-local `.codex` files do not fully enforce that generated baseline today.
- There is no signature or provenance check for the `codex` binary used during enrich.
