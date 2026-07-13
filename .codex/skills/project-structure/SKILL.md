# Project Structure

Use this skill when adding, moving, or reorganizing files in the repository.

## Goal

Preserve a predictable structure so code is easy to find and extend.

## File Placement Rules

- Follow the existing folder structure before proposing a new one.
- Put app-level entry concerns under `src/app`.
- Put shared UI components under `src/components`.
- Put reusable hooks under `src/hooks`.
- Put pure helpers and shared logic under `src/lib`.
- Put source data files under `src/data`.
- Put shared type definitions under `src/types` only when they are genuinely shared.

## Folder-Per-Module Pattern

- Components should live in their own folder when they are part of the maintained component surface.
- The component folder should contain the implementation file and a local barrel file.
- Prefer:
  - `Button/Button.tsx`
  - `Button/index.ts`
  - with `index.ts` exporting from `./Button`
- Apply the same pattern to reusable hooks and utility functions when they are first-class modules in the codebase.
- Prefer:
  - `hooks/usePromptAudio/usePromptAudio.ts`
  - `hooks/usePromptAudio/index.ts`
  - `lib/audio/getAudioPath/index.ts`
- Keep folder and file names aligned to the exported symbol.
- Do not use this pattern for throwaway private helpers that should stay local to a single file.

## New File Rules

- Prefer modifying an existing file when that keeps the design clearer.
- Add a new file only when it gives a real boundary or reuse point.
- Do not create placeholder files or speculative structure.
- Keep filenames and exports aligned with the dominant repo pattern.

## Utility and Hook Placement

- Do not define standalone reusable helpers deep inside unrelated component files.
- If logic is reusable and pure, move it into `lib`.
- If logic is reusable and React-specific, move it into `hooks`.
- Keep utility and hook names concrete and domain-specific.
- When creating reusable components, hooks, or utilities, prefer a dedicated folder with a local `index.ts` export.

## Import Discipline

- Prefer short, local-relative imports that match the existing style in the repo.
- Remove stale imports during refactors.
- Avoid creating circular dependencies through convenience re-exports.

## Refactoring Guidance

- When moving code, preserve behavior first and structure second.
- Update all affected imports in the same change.
- Delete obsolete files once the replacement is in place.

## Structure Checklist

Before finishing, confirm:

- Every new file has a clear reason to exist.
- The chosen location matches the repo’s structure.
- No dead files or orphaned imports remain.
