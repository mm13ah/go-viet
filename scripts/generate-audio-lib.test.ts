import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  type CommandRunner,
  type FileSystem,
  type GenerateAudioDependencies,
  type PiperSetup,
  buildManifestFile,
  generateAudioManifest,
  generateSpeech,
  resolvePiperSetup,
} from './generate-audio-lib.ts';

function createFileSystem(existingFiles: Iterable<string> = []): FileSystem {
  const files = new Set(existingFiles);

  return {
    access: vi.fn<(filePath: string) => Promise<void>>(async (filePath) => {
      if (
        !files.has(filePath) &&
        !path.basename(filePath).startsWith('.tmp-')
      ) {
        throw new Error(`missing: ${filePath}`);
      }
    }) as unknown as typeof import('node:fs/promises').access,
    mkdir: vi.fn<() => Promise<void>>(
      async () => {},
    ) as unknown as typeof import('node:fs/promises').mkdir,
    readFile: vi.fn<() => Promise<string>>(
      async () => 'khỏe\nacid\nmá',
    ) as unknown as typeof import('node:fs/promises').readFile,
    rename: vi.fn<(from: string, to: string) => Promise<void>>(
      async (from, to) => {
        files.delete(from);
        files.add(to);
      },
    ) as unknown as typeof import('node:fs/promises').rename,
    unlink: vi.fn<(filePath: string) => Promise<void>>(async (filePath) => {
      files.delete(filePath);
    }) as unknown as typeof import('node:fs/promises').unlink,
    writeFile: vi.fn<(filePath: string) => Promise<void>>(async (filePath) => {
      files.add(filePath);
    }) as unknown as typeof import('node:fs/promises').writeFile,
  };
}

function createDependencies(
  overrides: Partial<GenerateAudioDependencies> = {},
): GenerateAudioDependencies {
  return {
    env: overrides.env ?? { PIPER_MODEL_PATH: '/voices/vi_VN-demo.onnx' },
    fs: overrides.fs ?? createFileSystem(),
    log: overrides.log ?? {
      error: vi.fn<(...args: unknown[]) => void>(),
      log: vi.fn<(...args: unknown[]) => void>(),
    },
    runCommand:
      overrides.runCommand ??
      vi.fn<CommandRunner>(async () => ({
        stderr: '',
        stdout: '',
      })),
  };
}

describe('resolvePiperSetup', () => {
  it('fails clearly when the model path is missing', async () => {
    const dependencies = createDependencies({
      env: {},
    });

    await expect(resolvePiperSetup(dependencies)).rejects.toThrow(
      /PIPER_MODEL_PATH is required/i,
    );
  });

  it('fails clearly when the model config is missing', async () => {
    const modelPath = '/voices/vi_VN-demo.onnx';
    const dependencies = createDependencies({
      fs: createFileSystem([modelPath]),
    });

    await expect(resolvePiperSetup(dependencies)).rejects.toThrow(
      /Missing Piper JSON config/i,
    );
  });

  it('fails clearly when the Piper binary is unavailable', async () => {
    const modelPath = '/voices/vi_VN-demo.onnx';
    const dependencies = createDependencies({
      fs: createFileSystem([modelPath, `${modelPath}.json`]),
      runCommand: vi
        .fn<CommandRunner>()
        .mockRejectedValueOnce(new Error('spawn piper ENOENT')),
    });

    await expect(resolvePiperSetup(dependencies)).rejects.toThrow(
      /Piper executable is unavailable/i,
    );
  });

  it('fails clearly when ffmpeg is unavailable', async () => {
    const modelPath = '/voices/vi_VN-demo.onnx';
    const dependencies = createDependencies({
      fs: createFileSystem([modelPath, `${modelPath}.json`]),
      runCommand: vi
        .fn<CommandRunner>()
        .mockResolvedValueOnce({ stderr: '', stdout: '' })
        .mockRejectedValueOnce(new Error('spawn ffmpeg ENOENT')),
    });

    await expect(resolvePiperSetup(dependencies)).rejects.toThrow(
      /ffmpeg is required/i,
    );
  });
});

describe('generateSpeech', () => {
  const setup: PiperSetup = {
    ffmpegPath: 'ffmpeg',
    modelConfigPath: '/voices/vi_VN-demo.onnx.json',
    modelPath: '/voices/vi_VN-demo.onnx',
    piperPath: 'piper',
  };

  it('removes temporary files when ffmpeg conversion fails', async () => {
    const outputFile = '/tmp/khỏe.mp3';
    const fs = createFileSystem();
    const runCommand = vi
      .fn<CommandRunner>()
      .mockResolvedValueOnce({ stderr: '', stdout: '' })
      .mockRejectedValueOnce(new Error('ffmpeg failed'));

    await expect(
      generateSpeech(
        'khỏe',
        outputFile,
        setup,
        createDependencies({ fs, runCommand }),
      ),
    ).rejects.toThrow(/ffmpeg failed/i);

    expect(fs.unlink).toHaveBeenCalled();
  });
});

describe('generateAudioManifest', () => {
  it('skips existing audio files without requiring Piper', async () => {
    const existingFile = path.join(
      process.cwd(),
      'public/audio/khoe-4584016a.mp3',
    );
    const fs = createFileSystem([
      '/voices/vi_VN-demo.onnx',
      '/voices/vi_VN-demo.onnx.json',
      existingFile,
    ]);
    const runCommand = vi
      .fn<CommandRunner>()
      .mockRejectedValue(new Error('Piper should not be called'));
    const dependencies = createDependencies({ fs, runCommand });

    const summary = await generateAudioManifest(dependencies);

    expect(summary.skipped).toBe(1);
    expect(runCommand).not.toHaveBeenCalled();
  });
});

describe('buildManifestFile', () => {
  it('normalizes manifest keys before writing the generated file', () => {
    const manifestFile = buildManifestFile({
      'khỏanh khắc': 'khoanh-khac-7e139ad5.mp3',
      'thác lọan': 'thac-loan-a40a346f.mp3',
    });

    expect(manifestFile).toContain('"khoảnh khắc": "khoanh-khac-7e139ad5.mp3"');
    expect(manifestFile).toContain('"thác loạn": "thac-loan-a40a346f.mp3"');
    expect(manifestFile).not.toContain('khỏanh khắc');
    expect(manifestFile).not.toContain('thác lọan');
  });
});
