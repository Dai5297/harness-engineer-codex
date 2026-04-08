# Execution Plan Notes

## What the code supports today

- `harness task new <slug> --class A|B|C` creates a markdown plan under `docs/exec-plans/active/`.
- `harness task archive <slug>` appends missing completion sections and then moves the plan into `docs/exec-plans/completed/`.
- `harness status` checks active plans for required headings.

## Required structure enforced by code

- English repos must contain `## Status`, `## Goal`, `## Scope`, `## Work Plan`, and `## Validation Plan`.
- Chinese repos use the Chinese equivalents defined in `src/core/template-language.ts`.
- Bilingual repos are validated against the English core headings because the bilingual template contains both language blocks.

## Repo-specific guidance

- Open a plan when work spans more than one behavior surface such as CLI flow, template content, README contract, or enrich safety.
- Keep the plan tied to the exact workflow under change. This package has four real workflow families: `init`, `enrich`, `task`, and `status`.
- Record documentation updates explicitly. In this repo, doc drift is often part of the actual product change.
- Do not rewrite `docs/exec-plans/template.md` into package-specific content. Package-specific reasoning belongs in task files, not in the shared template.

## Current state

- The repository currently contains only the active/completed README stubs and the shared template; there are no task-specific plans checked in.
- Task classes are stored and validated, but the code does not assign documented semantics to `A`, `B`, or `C` beyond the enum and file metadata. That meaning remains an open process question.
