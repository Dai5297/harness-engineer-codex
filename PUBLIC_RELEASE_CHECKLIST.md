# Public Release Checklist

Use this before pushing the repository to GitHub or publishing the package to npm.

## Licensing And Positioning

- The repository is described as source-available or public-source, not OSI open source.
- `LICENSE.md` and `LICENSE.zh-CN.md` are present and current.
- `COMMERCIAL-LICENSING.md` explains how commercial users obtain rights.
- A real maintainer contact channel for commercial licensing is published.

## Repository Hygiene

- `node_modules/`, `dist/`, `coverage/`, and local smoke directories are removed.
- `.gitignore` covers generated and machine-local files.
- README exists in both English and Chinese.
- Tests do not depend on machine-local absolute paths.

## Release Validation

```bash
pnpm install
pnpm test
pnpm build
pnpm pack
```

## Package Metadata

- Add the final GitHub repository URL to `package.json` once the repository exists.
- Add homepage and issue tracker metadata if you want npm users to find the project easily.
- Review keywords and description before first publish.

## Optional Nice-To-Haves

- Add CI for `pnpm test` and `pnpm build`.
- Add badges to the README after the GitHub repo exists.
- Add a changelog and release notes template.

