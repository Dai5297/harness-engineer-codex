# Design Docs Index

## Current state

- No repo-specific design docs are checked in yet.
- The package rationale currently lives mostly in README, CHANGELOG, template files, and tests.

## Write a design doc when

- `status` drift semantics change
- the `enrich` safety model or Codex invocation contract changes
- a new preset is added or the managed file tree changes
- multilingual rendering or template-context behavior changes in a way downstream repos will notice

## Good first design-doc topics for this repo

- Template baseline versus enriched repo drift semantics
- Root-session and subagent policy for generated repos versus this repository's own `.codex` files
- Criteria for introducing a second preset beyond `generic-software`

## Starter template

Create new design docs from `docs/design-docs/template.md`.
