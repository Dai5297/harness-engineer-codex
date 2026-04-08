# Interface Notes

## Current state

This repository has no browser frontend, route tree, or client framework. The user-facing interface is a mix of:

- CLI stdout/stderr and confirmation prompts from `src/cli/` and `src/commands/`
- Markdown files generated from `templates/generic-software/`
- Public package narrative in `README.md` and `README.zh-CN.md`

## Practical guidance

- Treat terminal copy as product UI. Keep it terse, deterministic, and script-friendly.
- Treat generated markdown as long-lived interface output. Heading or filename changes affect downstream repos and `harness status`.
- Do not invent React, Tailwind, or browser-specific conventions here unless the repo actually grows a web or desktop UI.
- If a change only affects `coverage/` HTML output, it is a verification artifact change, not a frontend change.

## Where interface work lives

- CLI usage text: `src/cli/run.ts`
- Interactive prompts: `src/cli/io.ts`, `src/commands/init-command.ts`, `src/commands/enrich-command.ts`
- Generated document copy: `templates/generic-software/` and `templates/_locales/generic-software/zh/`
- Public-facing package explanation: `README.md`, `README.zh-CN.md`

## Non-goal reminder

This package scaffolds documentation and agent config. It does not currently ship a visual application shell of its own.
