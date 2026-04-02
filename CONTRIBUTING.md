# Contributing

## Development Setup

```bash
pnpm install
pnpm test
pnpm build
```

## Workflow

1. Add or update tests first.
2. Implement the smallest change that makes them pass.
3. Run `pnpm test` and `pnpm build` before opening a PR.
4. If you change generated output, update the relevant compatibility fixtures and tests in `tests/`.

## Project Rules

- Keep the package Codex-focused.
- Avoid machine-local absolute paths in generated templates.
- Do not commit `node_modules/`, `dist/`, `coverage/`, or ad hoc smoke directories.
- Keep presets manifest-driven rather than scattering hardcoded special cases.
- Do not describe the project as OSI open source while the repository uses the current source-available commercial licensing model.

## Contribution Licensing

By intentionally submitting a contribution for inclusion in this repository, you agree that the maintainers may distribute your contribution under:

- the repository's current Personal Free, Commercial Paid license
- any future commercial license offered by the maintainers for this project

## Useful Commands

```bash
pnpm test
pnpm test:coverage
pnpm build
pnpm pack
```
