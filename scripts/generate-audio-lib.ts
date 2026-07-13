import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import {
  access,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  normalizeTrainerEntry,
  parseTrainerWords,
} from '../src/data/words/index.ts';
import {
  getAudioFilename,
  normalizeAudioEntry,
} from '../src/lib/audioFiles/index.ts';

const ROOT_DIR = process.cwd();
const DICTIONARY_FILE = path.join(ROOT_DIR, 'src/data/dictionary.txt');
const AUDIO_DIR = path.join(ROOT_DIR, 'public/audio');
const AUDIO_MANIFEST_FILE = path.join(
  ROOT_DIR,
  'src/data/audioManifest/audioManifest.ts',
);

export type CommandResult = {
  stderr: string;
  stdout: string;
};

export type CommandRunner = (
  command: string,
  args: string[],
  options?: {
    cwd?: string;
    stdin?: string;
  },
) => Promise<CommandResult>;

export type FileSystem = {
  access: typeof access;
  mkdir: typeof mkdir;
  readFile: typeof readFile;
  rename: typeof rename;
  unlink: typeof unlink;
  writeFile: typeof writeFile;
};

export type Logger = Pick<typeof console, 'error' | 'log'>;

export type PiperSetup = {
  ffmpegPath: string;
  modelConfigPath: string;
  modelPath: string;
  piperPath: string;
};

export type GenerateAudioDependencies = {
  env: NodeJS.ProcessEnv;
  fs: FileSystem;
  log: Logger;
  runCommand: CommandRunner;
};

export type GenerationSummary = {
  entries: number;
  failed: number;
  generated: number;
  skipped: number;
};

const defaultDependencies: GenerateAudioDependencies = {
  env: process.env,
  fs: {
    access,
    mkdir,
    readFile,
    rename,
    unlink,
    writeFile,
  },
  log: console,
  runCommand,
};

export async function fileExists(
  filePath: string,
  filesystem: FileSystem = defaultDependencies.fs,
): Promise<boolean> {
  try {
    await filesystem.access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    stdin?: string;
  } = {},
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? ROOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stderr, stdout });
        return;
      }

      reject(
        new Error(
          stderr.trim() ||
            stdout.trim() ||
            `${command} exited with code ${code}`,
        ),
      );
    });

    if (options.stdin) {
      child.stdin.write(options.stdin, 'utf8');
    }

    child.stdin.end();
  });
}

function getRequiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is required. Example:\nPIPER_MODEL_PATH="$HOME/voices/vi_VN-example.onnx" npm run generate-audio`,
    );
  }

  return value;
}

function createTempFilePath(
  directory: string,
  extension: '.wav' | '.mp3',
): string {
  return path.join(directory, `.tmp-${randomUUID()}${extension}`);
}

async function cleanupFile(
  filePath: string,
  filesystem: FileSystem,
): Promise<void> {
  if (await fileExists(filePath, filesystem)) {
    await filesystem.unlink(filePath);
  }
}

export async function resolvePiperSetup(
  dependencies: GenerateAudioDependencies = defaultDependencies,
): Promise<PiperSetup> {
  const piperPath = dependencies.env['PIPER_BIN_PATH']?.trim() || 'piper';
  const ffmpegPath = 'ffmpeg';
  const modelPath = getRequiredEnv('PIPER_MODEL_PATH', dependencies.env);

  if (!path.isAbsolute(modelPath)) {
    throw new Error(
      `PIPER_MODEL_PATH must be an absolute path. Received: ${modelPath}`,
    );
  }

  const modelConfigPath = `${modelPath}.json`;

  if (!(await fileExists(modelPath, dependencies.fs))) {
    throw new Error(
      `PIPER_MODEL_PATH points to a missing ONNX model: ${modelPath}`,
    );
  }

  if (!(await fileExists(modelConfigPath, dependencies.fs))) {
    throw new Error(
      `Missing Piper JSON config beside the model: ${modelConfigPath}`,
    );
  }

  try {
    await dependencies.runCommand(piperPath, ['--help']);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Piper error.';

    throw new Error(
      `Piper executable is unavailable. Install Piper and set PIPER_BIN_PATH if it is not on PATH. ${message}`,
    );
  }

  try {
    await dependencies.runCommand(ffmpegPath, ['-version']);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown ffmpeg error.';

    throw new Error(
      `ffmpeg is required to convert Piper WAV output to mp3. Install ffmpeg and retry. ${message}`,
    );
  }

  return {
    ffmpegPath,
    modelConfigPath,
    modelPath,
    piperPath,
  };
}

export async function generateSpeech(
  text: string,
  outputFile: string,
  setup: PiperSetup,
  dependencies: GenerateAudioDependencies = defaultDependencies,
): Promise<void> {
  const outputDirectory = path.dirname(outputFile);
  const tempWavFile = createTempFilePath(outputDirectory, '.wav');
  const tempMp3File = createTempFilePath(outputDirectory, '.mp3');

  await dependencies.fs.mkdir(outputDirectory, { recursive: true });

  try {
    await dependencies.runCommand(
      setup.piperPath,
      [
        '--model',
        setup.modelPath,
        '--config',
        setup.modelConfigPath,
        '--output-file',
        tempWavFile,
      ],
      {
        stdin: `${normalizeAudioEntry(text)}\n`,
      },
    );

    await dependencies.runCommand(setup.ffmpegPath, [
      '-y',
      '-i',
      tempWavFile,
      '-codec:a',
      'libmp3lame',
      '-q:a',
      '2',
      tempMp3File,
    ]);

    await dependencies.fs.rename(tempMp3File, outputFile);
  } finally {
    await cleanupFile(tempWavFile, dependencies.fs);
    await cleanupFile(tempMp3File, dependencies.fs);
  }
}

export function buildManifestFile(entries: Record<string, string>): string {
  const normalizedEntries = Object.entries(entries).reduce<
    Record<string, string>
  >((manifest, [entry, fileName]) => {
    manifest[normalizeTrainerEntry(entry)] = fileName;
    return manifest;
  }, {});

  const lines = Object.entries(normalizedEntries)
    .sort(([left], [right]) => left.localeCompare(right, 'vi'))
    .map(
      ([entry, fileName]) =>
        `  ${JSON.stringify(entry)}: ${JSON.stringify(fileName)},`,
    );

  if (lines.length === 0) {
    return 'export const audioManifest: Record<string, string> = {}\n';
  }

  return [
    '// This file is generated by scripts/generate-audio.ts.',
    'export const audioManifest: Record<string, string> = {',
    ...lines,
    '}',
    '',
  ].join('\n');
}

export async function generateAudioManifest(
  dependencies: GenerateAudioDependencies = defaultDependencies,
): Promise<GenerationSummary> {
  await dependencies.fs.mkdir(AUDIO_DIR, { recursive: true });

  const dictionarySource = await dependencies.fs.readFile(
    DICTIONARY_FILE,
    'utf8',
  );
  const entries = parseTrainerWords(dictionarySource);

  if (entries.length === 0) {
    throw new Error('No dictionary entries found in src/data/dictionary.txt.');
  }

  const manifest: Record<string, string> = {};
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let setup: PiperSetup | null = null;

  for (const entry of entries) {
    const fileName = getAudioFilename(entry);
    const outputFile = path.join(AUDIO_DIR, fileName);

    manifest[normalizeTrainerEntry(entry)] = fileName;

    if (await fileExists(outputFile, dependencies.fs)) {
      skipped += 1;
      dependencies.log.log(`skip  ${entry} -> ${fileName}`);
      continue;
    }

    try {
      if (!setup) {
        setup = await resolvePiperSetup(dependencies);
        dependencies.log.log(
          `Generating audio for ${entries.length} entries with Piper model "${setup.modelPath}".`,
        );
      }

      await generateSpeech(entry, outputFile, setup, dependencies);
      generated += 1;
      dependencies.log.log(`write ${entry} -> ${fileName}`);
    } catch (error) {
      failed += 1;
      delete manifest[normalizeTrainerEntry(entry)];
      dependencies.log.error(
        `fail  ${entry}: ${error instanceof Error ? error.message : 'Unknown error.'}`,
      );
    }
  }

  await dependencies.fs.writeFile(
    AUDIO_MANIFEST_FILE,
    buildManifestFile(manifest),
    'utf8',
  );

  return {
    entries: entries.length,
    failed,
    generated,
    skipped,
  };
}
