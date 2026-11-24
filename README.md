# Gõ Việt

Build Vietnamese Telex muscle memory.

## Dictionary

Trainer entries live in `src/data/dictionary.txt`, one Vietnamese word or phrase per line.

## What It Does

Gõ Việt is a small client-side trainer for practicing Vietnamese Telex input.
Each round shows a Vietnamese target word or phrase. You can answer in either of
these forms:

- Raw Telex, such as `khoer`
- Already-composed Vietnamese, such as `khỏe`

The app accepts both so it works whether your keyboard is set to English or a
Vietnamese input method.

Progress is stored locally in `localStorage`, including:

- total correct answers
- best streak
- recent history

## Setup

Requirements:

- Node.js 22.22.2 (see `.nvmrc`)
- npm 10.9.7

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev`: start Vite in development mode
- `npm run build`: run TypeScript build checks and create a production build
- `npm run preview`: preview the production build locally
- `npm run generate-audio`: generate static `public/audio/*.mp3` files and refresh the audio manifest
- `npm test`: start Vitest in watch mode
- `npm run test:run`: run the test suite once
- `npm run test:coverage`: run tests with coverage
- `npm run lint`: run Oxlint
- `npm run lint:fix`: run Oxlint with autofix
- `npm run format`: format the repository with Prettier
- `npm run format:check`: check formatting without writing changes
- `npm run check`: run the fast CI suite locally
- `npm run check:all`: run the fast suite and the runtime dependency audit
- `npm run check:deps`: enforce import direction and reject dependency cycles
- `npm run check:structure`: enforce the component folder and barrel conventions
- `npm run check:dead-code`: find unused files, exports, and dependencies
- `npm run storybook`: develop components in Storybook
- `npm run build-storybook`: verify every component story builds

Installing dependencies also installs Lefthook. Commits run the fast checks and
secret scan; pushes run the runtime dependency audit and scan the commits being
pushed. Commit messages follow the Conventional Commits format. Secret scanning
uses a local `gitleaks` binary when available and otherwise requires Docker.
The structure check requires every component to have a colocated test, every
atom and molecule to have a Storybook story, and every component/layer barrel
to exactly match its folders.

## Audio Generation

Pronunciation audio is generated offline and committed to the repository. The app remains a static Vite site and only plays prebuilt mp3 files from `public/audio/`.

Piper is used instead of Kokoro because the official `kokoro` package documents `KPipeline` language codes for English, Spanish, French, Hindi, Italian, Japanese, Portuguese, and Mandarin, but not Vietnamese. Piper is a better fit here because it accepts a local ONNX voice model, reads text from stdin, and writes WAV output that we can convert to MP3 offline.

Requirements:

- Node.js 20+
- npm
- Piper installed locally
- `ffmpeg` available on `PATH`
- a Vietnamese `vi_VN` Piper voice `.onnx` file
- the matching `.onnx.json` config file beside that model

Install `ffmpeg` on macOS:

```bash
brew install ffmpeg
```

Install Piper:

- install a local Piper binary and put it on your `PATH`, or
- set `PIPER_BIN_PATH=/absolute/path/to/piper`

Obtain a Vietnamese voice:

- download a Piper `vi_VN` ONNX voice model
- place the matching config beside it so both files exist:
  - `/absolute/path/to/voice.onnx`
  - `/absolute/path/to/voice.onnx.json`

Required environment variables:

- `PIPER_MODEL_PATH=/absolute/path/to/voice.onnx`

Optional environment variables:

- `PIPER_BIN_PATH=/absolute/path/to/piper`

Generate audio:

```bash
PIPER_MODEL_PATH="$HOME/voices/vi_VN-voice.onnx" \
npm run generate-audio
```

Regenerate after editing `src/data/dictionary.txt`:

```bash
PIPER_MODEL_PATH="$HOME/voices/vi_VN-voice.onnx" \
npm run generate-audio
```

Notes:

- existing mp3 files are skipped
- failures are reported and the script continues
- generated filenames use `<ascii-slug>-<short-hash>.mp3` so differently accented entries do not collide
- the runtime app never invokes Piper or ffmpeg; it only uses static files from `public/audio/`

## Raw Telex vs Composed Vietnamese

The visible input field is converted as you type. The trainer then compares the
current value against the target Vietnamese.

That means all of these can be valid answers depending on the prompt:

- `khoer` -> `khỏe`
- `tieesng Vieetj` -> `tiếng Việt`
- `khỏe` -> `khỏe`

## Deployment To Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Keep the default Vite settings.
4. Use `npm run build` as the build command.
5. Deploy.

No server-side environment variables are required for this MVP.
