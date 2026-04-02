# Open-Source Release Checklist

Use this before publishing the package to npm or pushing release updates to GitHub.

## Versioning

- `package.json` version is bumped before publishing.
- `CHANGELOG.md` contains a short entry for the release.
- The published version is higher than the current npm `latest` tag.

## Licensing And Positioning

- The repository is described as open source.
- The package license is MIT in both `package.json` and `LICENSE`.
- README links point to the MIT license and current GitHub repository.

## Repository Hygiene

- `node_modules/`, `dist/`, `coverage/`, and local smoke directories are removed.
- `.gitignore` covers generated and machine-local files.
- README exists in both English and Chinese.
- Tests do not depend on machine-local absolute paths.

## Release Validation

```bash
pnpm install
pnpm release:check
npm info harness-engineer
npm publish --access public
```

## Package Metadata

- `repository`, `homepage`, and `bugs` point to the live GitHub repository.
- The published npm package points back to the same GitHub repository metadata.
- The README documents both `pnpm dlx` and installed CLI usage.
- The README documents GitHub-based installation as a fallback path.
- The package description and keywords reflect the published positioning.
- `main`, `types`, and `exports` all resolve to published `dist/` files.

## Optional Nice-To-Haves

- Add CI for `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Add badges to the README.
- Add automated release notes or git tag automation.
