# Frontend Architecture

Use this skill for React, component, styling, and UI structure changes in this repository.

## Goal

Keep the frontend simple, modular, and consistent with the project’s component architecture.

## Component Boundaries

- Keep presentational components focused on rendering and interaction wiring.
- Move reusable stateful logic into hooks when it is shared or meaningfully separable from rendering.
- Move pure transformation logic into utilities instead of defining helper functions inline inside components.
- Do not create custom hooks or utilities for one trivial call site.

## Atomic Design Expectations

- Put small reusable primitives in `components/atoms`.
- Put composed UI blocks in `components/molecules`.
- Put larger composed feature sections in `components/organisms`.
- Do not force atomic design mechanically if a new file would only wrap a single element without adding clarity.

## State and Effects

- Keep state as local as possible.
- Avoid effect-heavy designs when derived state or direct event handling is enough.
- Do not add defensive effects that merely mirror props into state unless there is a concrete reason.
- Treat effects as integration points, not as general-purpose control flow.

## Styling

- Follow the existing styling approach already present in the repo.
- Reuse existing visual patterns, spacing, and component APIs where practical.
- Avoid one-off styling abstractions unless they are clearly reused.
- Keep accessibility intact when changing visuals.

## Accessibility

- Interactive controls must have accessible names.
- Preserve keyboard usability for toggles, buttons, and inputs.
- Use semantic HTML before adding ARIA.

## Frontend Change Checklist

Before finishing, confirm:

- Logic is not leaking into the wrong layer.
- The new UI matches existing component conventions.
- State is not duplicated unnecessarily.
- Accessibility has not regressed.
