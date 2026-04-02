# {{projectName}} Architecture

## System intent

Describe the system in one paragraph: what it exists to do, who it serves, and what must stay stable even as the implementation changes.

## Boundary model

{{#list architectureBoundaries}}

## Document this before major changes

- Major modules and their responsibilities
- Cross-module contracts or APIs
- Data ownership and lifecycle rules
- Operational dependencies and failure boundaries

## Dependency rules

1. Keep policy and business rules out of thin glue code.
2. Avoid letting external SDKs define internal domain language.
3. Prefer stable interfaces between layers over convenience imports.
4. Record architectural exceptions with a reason and cleanup trigger.

## Change checklist

- Which boundary is changing?
- Which document becomes stale if this lands?
- Which downstream callers or jobs must be retested?
- Which behavior should remain unchanged after the refactor?
