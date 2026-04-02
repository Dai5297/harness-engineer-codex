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
- Keep the package MIT-licensed and npm-installable without requiring a repository clone for end users.
- Keep published package metadata aligned with generated `dist/` output.

## Contribution Licensing

By intentionally submitting a contribution for inclusion in this repository, you agree that the maintainers may distribute your contribution under:

- the repository's MIT license

## Useful Commands

```bash
pnpm test
pnpm test:coverage
pnpm build
pnpm pack
pnpm release:check
```
