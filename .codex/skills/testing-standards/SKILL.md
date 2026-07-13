# Testing Standards

Use this skill when adding or changing tests in this repository.

## Goal

Test the behavior that matters without producing noisy, brittle, or over-mocked tests.

## What to Test

- Test user-visible behavior and core logic.
- Add regression coverage for bugs that were fixed.
- Cover realistic edge cases, especially around parsing, normalization, state transitions, and conditional UI.

## What Not to Test

- Do not test implementation details that can change during refactors.
- Avoid snapshot-heavy tests unless the output is unusually stable and meaningful.
- Do not add tests that simply restate trivial framework behavior.

## Mocking Rules

- Mock external boundaries and unstable integrations only as needed.
- Prefer narrow mocks over broad environment simulation.
- Do not over-mock internal code when the real behavior is cheap and deterministic.

## Test Style

- Write tests with clear setup, action, and expectation flow.
- Name tests in terms of behavior, not internal functions.
- Keep fixtures small and representative.
- Prefer focused regression tests over giant multi-assertion tests.

## When to Add Tests

- Add or update tests when changing behavior, fixing bugs, or adding normalization and validation rules.
- If a change is purely presentational and low risk, avoid inventing unnecessary tests.

## Testing Checklist

Before finishing, confirm:

- The tests verify behavior that matters to users or core logic.
- The tests are robust against ordinary refactors.
- Mocking is minimal and intentional.
- The changed behavior is covered by at least one clear assertion.
