# Reliability Notes

## Workflow boundaries

- `init` is a deterministic local filesystem workflow: inspect target directory, render managed files, update or create `package.json`, and write the scaffold.
- `enrich` is the highest-variance workflow: inspect the repo, scaffold missing harness files, verify Codex availability, then hand off to `codex exec`.
- `task` is a local markdown workflow: render plan files, append completion sections, and move files between active/completed directories.
- `status` is a read-only scan: load config, re-render expected files, compare exact content, and inspect plan headings.

## Failure boundaries that matter

- Invalid target directories fail early in `inspectTargetDirectory`.
- `enrich` fails closed on empty or obviously non-project directories.
- Missing or broken Codex binaries fail before the repo-specific prompt is sent.
- Non-zero Codex exit codes are surfaced with stderr rather than silently ignored.
- `status` can report drift for intentional repo authorship because it compares exact rendered content, not semantic equivalence.

## Observed local timings

These are local measurements from `2026-04-02`, not product SLOs:

- `pnpm test`: about `1.40s`
- `pnpm test:coverage`: about `1.58s`
- `pnpm build`: about `0.51s`

## Reliability rules for this repo

- Default to create-missing writes. Overwrite behavior should remain opt-in via `--force`.
- Keep plan validation simple and predictable. The code currently checks for required headings, not semantic completeness.
- Treat Codex availability, authentication, and repo write behavior as external dependency risk, not as guaranteed package behavior.
- Keep README troubleshooting aligned with the actual error paths in `src/core/enrich-service.ts` and `src/core/codex-runner.ts`.

## Operator checklist

- If `harness enrich` says Codex is missing, install or repair Codex and run `codex login` before retrying.
- If `status` reports drift, decide whether it reflects expected repo authorship or an accidental mismatch between source, templates, and docs.
- If a plan is inconsistent, check the required headings first before rewriting the whole file.
- If workflow timing or failure behavior changes, update this file and the matching integration tests together.
