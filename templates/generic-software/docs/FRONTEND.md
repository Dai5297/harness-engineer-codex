# Frontend Guide

## What belongs here

- Route ownership and page boundaries
- Shared UI patterns and interaction rules
- State-management conventions
- Accessibility and responsiveness expectations

## Default rules

1. Keep presentation components focused on rendering and interaction.
2. Push data fetching, policy checks, and transformation closer to feature boundaries.
3. Reuse patterns only when they actually communicate the same meaning.
4. Treat loading, error, and empty states as part of the feature, not edge cases.

## When to update this file

Update this file when a frontend rule should apply beyond a single feature or PR.
