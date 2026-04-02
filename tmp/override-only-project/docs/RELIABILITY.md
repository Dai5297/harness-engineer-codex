# Reliability Guide

## Baseline expectations

- Name the critical path, expected latency budget, and failure mode for every user-facing workflow.
- Log enough structured context to debug production failures without replaying the whole session.
- Prefer safe degradation over hidden failure when external services or automation steps break.
- Write runbooks for workflows that are easy to misoperate or expensive to recover.

## Record here

- Availability expectations
- Performance budgets
- Retry, timeout, and fallback rules
- Operator-facing diagnostics

## Verification prompts

- What breaks first when a dependency is slow?
- What happens when automation is partially successful?
- Which failures are visible to users, and which are only in logs?
