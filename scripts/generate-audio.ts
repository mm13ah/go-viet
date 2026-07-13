import { generateAudioManifest } from './generate-audio-lib.ts';

async function main(): Promise<void> {
  try {
    const summary = await generateAudioManifest();

    console.log('');
    console.log('Audio generation summary');
    console.log(`entries:    ${summary.entries}`);
    console.log(`generated:  ${summary.generated}`);
    console.log(`skipped:    ${summary.skipped}`);
    console.log(`failed:     ${summary.failed}`);

    if (summary.failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Audio generation failed.',
    );
    process.exitCode = 1;
  }
}

void main();
