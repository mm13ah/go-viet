const MIN_LETTER_COUNT = 3;
const wordsFileUrl = new URL('../dictionary.txt', import.meta.url);
const DISALLOWED_TELEX_LETTERS = /[fjwz]/u;
const LETTERS_AND_SPACES_ONLY = /^[\p{L}\s]+$/u;
const ASCII_ONLY = /^[a-z]+$/u;
const VIETNAMESE_VOWEL =
  /[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/iu;
const INVALID_ASCII_ENDING = /(?:b|d|đ|f|g|h|j|k|l|q|r|s|v|x|z)$/u;
const VALID_ASCII_CODA = /(ch|ng|nh|c|m|n|p|t)$/u;
const DOUBLED_ASCII_CONSONANT = /([b-df-hj-np-tv-xz])\1/u;
const BLOCKED_TRAINER_TOKENS = new Set([
  'acid',
  'byte',
  'gigabyte',
  'kilobyte',
  'megabyte',
  'container',
  'euro',
  'logic',
  'video',
  'radio',
  'vitamin',
  'polyvitamin',
  'moóc',
  'soóc',
  'buýt',
  'búyt',
  'xích',
  'lô',
]) as ReadonlySet<string>;
const BLOCKED_TRAINER_PHRASES = new Set([
  'mô tô',
  'mô tô ba bánh',
  'xích lô',
]) as ReadonlySet<string>;
const LEGACY_TONE_PAIRS = [
  ['oà', 'òa'],
  ['oá', 'óa'],
  ['oả', 'ỏa'],
  ['oã', 'õa'],
  ['ọa', 'oạ'],
  ['oè', 'òe'],
  ['oé', 'óe'],
  ['oẻ', 'ỏe'],
  ['oẽ', 'õe'],
  ['oẹ', 'ọe'],
  ['uý', 'úy'],
  ['uỳ', 'ùy'],
  ['uỷ', 'ủy'],
  ['uỹ', 'ũy'],
  ['uỵ', 'ụy'],
  ['Oà', 'Òa'],
  ['Oá', 'Óa'],
  ['Oả', 'Ỏa'],
  ['Oã', 'Õa'],
  ['Ọa', 'Oạ'],
  ['Oè', 'Òe'],
  ['Oé', 'Óe'],
  ['Oẻ', 'Ỏe'],
  ['Oẽ', 'Õe'],
  ['Oẹ', 'Ọe'],
  ['Uý', 'Úy'],
  ['Uỳ', 'Ùy'],
  ['Uỷ', 'Ủy'],
  ['Uỹ', 'Ũy'],
  ['Uỵ', 'Ụy'],
] as const;

const LEGACY_OA_GLIDE_PATTERNS = [
  [/óa(?=[iy])/gu, 'oá'],
  [/òa(?=[iy])/gu, 'oà'],
  [/ỏa(?=[iy])/gu, 'oả'],
  [/õa(?=[iy])/gu, 'oã'],
  [/ọa(?=[iy])/gu, 'oạ'],
  [/Óa(?=[iy])/gu, 'Oá'],
  [/Òa(?=[iy])/gu, 'Oà'],
  [/Ỏa(?=[iy])/gu, 'Oả'],
  [/Õa(?=[iy])/gu, 'Oã'],
  [/Ọa(?=[iy])/gu, 'Oạ'],
  [/óa(?=nh)/gu, 'oá'],
  [/òa(?=nh)/gu, 'oà'],
  [/ỏa(?=nh)/gu, 'oả'],
  [/õa(?=nh)/gu, 'oã'],
  [/ọa(?=nh)/gu, 'oạ'],
  [/Óa(?=nh)/gu, 'Oá'],
  [/Òa(?=nh)/gu, 'Oà'],
  [/Ỏa(?=nh)/gu, 'Oả'],
  [/Õa(?=nh)/gu, 'Oã'],
  [/Ọa(?=nh)/gu, 'Oạ'],
  [/óa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'oá'],
  [/òa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'oà'],
  [/ỏa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'oả'],
  [/õa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'oã'],
  [/ọa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'oạ'],
  [/Óa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'Oá'],
  [/Òa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'Oà'],
  [/Ỏa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'Oả'],
  [/Õa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'Oã'],
  [/Ọa(?=(?:c|ch|m|n|ng|p|t)\b)/gu, 'Oạ'],
] as const;

let trainerWordsPromise: Promise<string[]> | null = null;

function countLetters(value: string): number {
  const matches = value.match(/\p{L}/gu);

  return matches?.length ?? 0;
}

function isTrainerSafeToken(token: string): boolean {
  const normalizedToken = token.toLocaleLowerCase('vi');

  if (BLOCKED_TRAINER_TOKENS.has(normalizedToken)) {
    return false;
  }

  if (DISALLOWED_TELEX_LETTERS.test(normalizedToken)) {
    return false;
  }

  if (!VIETNAMESE_VOWEL.test(normalizedToken)) {
    return false;
  }

  if (!ASCII_ONLY.test(normalizedToken)) {
    return true;
  }

  if (DOUBLED_ASCII_CONSONANT.test(normalizedToken)) {
    return false;
  }

  if (
    INVALID_ASCII_ENDING.test(normalizedToken) &&
    !VALID_ASCII_CODA.test(normalizedToken)
  ) {
    return false;
  }

  if (/q(?!u)/u.test(normalizedToken)) {
    return false;
  }

  if (/c(?=[eiy])/u.test(normalizedToken)) {
    return false;
  }
  return true;
}

export function normalizeTrainerEntry(value: string): string {
  const normalizedValue = LEGACY_TONE_PAIRS.reduce(
    (normalizedValue, [legacyForm, modernForm]) =>
      normalizedValue.replaceAll(legacyForm, modernForm),
    value.normalize('NFC'),
  );

  return LEGACY_OA_GLIDE_PATTERNS.reduce(
    (currentValue, [pattern, replacement]) =>
      currentValue.replace(pattern, replacement),
    normalizedValue,
  );
}

export function isTrainerSafeWord(value: string): boolean {
  const normalizedValue = normalizeTrainerEntry(value);

  if (BLOCKED_TRAINER_PHRASES.has(normalizedValue.toLocaleLowerCase('vi'))) {
    return false;
  }

  if (!LETTERS_AND_SPACES_ONLY.test(normalizedValue)) {
    return false;
  }

  return normalizedValue.split(/\s+/u).every(isTrainerSafeToken);
}

export function parseTrainerWords(source: string): string[] {
  const seen = new Set<string>();

  return source
    .split(/\r?\n/u)
    .map((line) => normalizeTrainerEntry(line.trim()))
    .filter((line) => line.length > 0)
    .filter((line) => countLetters(line) >= MIN_LETTER_COUNT)
    .filter(isTrainerSafeWord)
    .filter((line) => {
      if (seen.has(line)) {
        return false;
      }

      seen.add(line);
      return true;
    });
}

export async function loadTrainerWords(): Promise<string[]> {
  if (!trainerWordsPromise) {
    trainerWordsPromise = fetch(wordsFileUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load trainer words.');
        }

        return response.text();
      })
      .then(parseTrainerWords);
  }

  return trainerWordsPromise;
}
