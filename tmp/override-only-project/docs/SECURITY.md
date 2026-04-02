# Security Guide

## Baseline expectations

- Validate every untrusted input at the boundary where it first enters the system.
- Treat secrets, tokens, and credentials as runtime configuration only; never hardcode them.
- Document authorization, audit, and data-handling expectations before shipping sensitive changes.
- Call for explicit review when a change touches authentication, permissions, payments, or data export.

## Review triggers

- Authentication or session handling changes
- Authorization or permissions work
- Payment, billing, or export flows
- Sensitive data capture, transformation, or deletion
- New third-party integrations with broad access

## Evidence to capture

- Validation boundaries
- Secret and credential handling
- Audit or traceability expectations
- Known residual risks and why they are acceptable
