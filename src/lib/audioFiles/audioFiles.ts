const COMBINING_MARKS = /[\u0300-\u036f]/gu;
const INVALID_FILE_CHARACTERS = /[<>:"/\\|?*]/u;
const NON_ALPHANUMERIC = /[^a-z0-9]+/gu;
const TRIMMED_HYPHENS = /^-+|-+$/gu;

function stripInvalidFileCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      if (INVALID_FILE_CHARACTERS.test(character)) {
        return false;
      }

      return character.charCodeAt(0) >= 32;
    })
    .join('');
}

function transliterateVietnamese(value: string): string {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/gu, 'd')
    .replace(/Đ/gu, 'D');
}

export function normalizeAudioEntry(entry: string): string {
  return entry.trim().normalize('NFC');
}

export function createAudioHash(entry: string): string {
  let hash = 0x811c9dc5;

  for (const character of normalizeAudioEntry(entry)) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}

export function createReadableAudioSlug(entry: string): string {
  const sanitizedEntry = stripInvalidFileCharacters(
    transliterateVietnamese(normalizeAudioEntry(entry)),
  )
    .toLocaleLowerCase('en')
    .replace(NON_ALPHANUMERIC, '-')
    .replace(TRIMMED_HYPHENS, '');

  return sanitizedEntry || 'entry';
}

export function getAudioFilename(entry: string): string {
  const normalizedEntry = normalizeAudioEntry(entry);

  return `${createReadableAudioSlug(normalizedEntry)}-${createAudioHash(normalizedEntry)}.mp3`;
}
