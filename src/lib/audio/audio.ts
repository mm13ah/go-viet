import { audioManifest } from '../../data/audioManifest';
import { normalizeTrainerEntry } from '../../data/words';

const normalizedAudioManifest = Object.fromEntries(
  Object.entries(audioManifest).map(([entry, fileName]) => [
    normalizeTrainerEntry(entry),
    fileName,
  ]),
);

export function getAudioPath(entry: string): string | null {
  const fileName = normalizedAudioManifest[normalizeTrainerEntry(entry)];

  if (!fileName) {
    return null;
  }

  return `/audio/${encodeURIComponent(fileName)}`;
}
