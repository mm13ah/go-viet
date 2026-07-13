# Engineering Standards

Use this skill for any coding task in this repository.

## Goal

Produce code that is readable, reusable, maintainable, and consistent with the existing codebase.

## Working Rules

### Reuse before adding

- Search for existing utilities, hooks, components, and patterns before adding new code.
- If similar logic already exists, prefer refactoring to a shared implementation over copy-pasting.
- Do not create a shared abstraction for a single call site.

### Keep responsibilities separate

- Do not mix UI rendering with business logic.
- Do not mix API or data access logic into presentation components.
- Keep modules narrowly focused on one responsibility.

### Prefer simple code

- Prefer explicit code over clever code.
- Avoid nested ternaries, dense chaining, and overly generic helper names.
- Use names that describe the real domain concept.

### Avoid unnecessary abstraction

- Do not introduce new architectural patterns without precedent in the repo.
- Do not create wrapper helpers, config layers, or generic processors unless they clearly reduce complexity.
- Delete, simplify, or modify existing code before adding new layers.

### Maintain a single source of truth

- Centralize shared constants, normalization rules, and reusable logic.
- Do not duplicate important values or business rules across files.

### Error handling

- Never swallow failures silently.
- Do not use empty `catch` blocks unless there is a deliberate, documented reason.
- Handle realistic failure cases explicitly and propagate the rest.

### Type discipline

- Avoid `any` unless there is no practical alternative.
- Keep types aligned to real runtime data.
- Prefer straightforward types over elaborate type machinery.

### Dependency discipline

- Prefer existing tools and libraries already used in the repo.
- Do not add new dependencies unless they materially simplify the solution.

## Output Standards

- Match the codebase’s existing naming, structure, and formatting.
- Remove dead code, unused imports, and outdated paths as part of the change.
- Do not over-implement beyond the user request.

## Pre-Submit Checklist

Before finishing, confirm:

- No logic was duplicated unnecessarily.
- No new abstraction was added without a real second use or strong justification.
- Responsibilities remain clearly separated.
- Error handling is intentional.
- The final code is simpler or at least no more complex than before.
