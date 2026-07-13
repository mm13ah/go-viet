import {
  normalizeForComparison,
  normalizeVietnamese,
} from '../normalizeVietnamese';

const TONE_INDEX = {
  none: 0,
  s: 1,
  f: 2,
  r: 3,
  x: 4,
  j: 5,
} as const;

const TONE_KEYS = new Set(['s', 'f', 'r', 'x', 'j']);

const VOWEL_TABLE = {
  a: ['a', 'á', 'à', 'ả', 'ã', 'ạ'],
  ă: ['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'],
  â: ['â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'],
  e: ['e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'],
  ê: ['ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'],
  i: ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'],
  o: ['o', 'ó', 'ò', 'ỏ', 'õ', 'ọ'],
  ô: ['ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'],
  ơ: ['ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'],
  u: ['u', 'ú', 'ù', 'ủ', 'ũ', 'ụ'],
  ư: ['ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'],
  y: ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],
  A: ['A', 'Á', 'À', 'Ả', 'Ã', 'Ạ'],
  Ă: ['Ă', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ'],
  Â: ['Â', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ'],
  E: ['E', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ'],
  Ê: ['Ê', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ'],
  I: ['I', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị'],
  O: ['O', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ'],
  Ô: ['Ô', 'Ố', 'Ồ', 'Ổ', 'Ỗ', 'Ộ'],
  Ơ: ['Ơ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ'],
  U: ['U', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ'],
  Ư: ['Ư', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự'],
  Y: ['Y', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ'],
} as const;

const FAMILY_BY_CHAR = new Map<string, string>();
const TONE_BY_CHAR = new Map<string, number>();

for (const [family, chars] of Object.entries(VOWEL_TABLE)) {
  chars.forEach((char, index) => {
    FAMILY_BY_CHAR.set(char, family);
    TONE_BY_CHAR.set(char, index);
  });
}

function isLetter(char: string): boolean {
  return /\p{L}/u.test(char);
}

function isToneKey(char: string): boolean {
  return TONE_KEYS.has(char.toLocaleLowerCase('vi'));
}

function isVowel(char: string): boolean {
  return FAMILY_BY_CHAR.has(char);
}

function getFamily(char: string): string {
  return FAMILY_BY_CHAR.get(char) ?? char;
}

function getBaseFamily(char: string): string {
  return getFamily(char).toLocaleLowerCase('vi');
}

function removeTone(char: string): string {
  const family = getFamily(char);
  const chars = VOWEL_TABLE[family as keyof typeof VOWEL_TABLE];

  if (!chars) {
    return char;
  }

  return chars[TONE_INDEX.none];
}

function getToneKey(char: string): keyof typeof TONE_INDEX | null {
  const toneIndex = TONE_BY_CHAR.get(char);

  switch (toneIndex) {
    case TONE_INDEX.s:
      return 's';
    case TONE_INDEX.f:
      return 'f';
    case TONE_INDEX.r:
      return 'r';
    case TONE_INDEX.x:
      return 'x';
    case TONE_INDEX.j:
      return 'j';
    default:
      return null;
  }
}

function transliterateChar(char: string): string {
  const toneFreeChar = removeTone(char);

  switch (toneFreeChar) {
    case 'â':
      return 'aa';
    case 'ă':
      return 'aw';
    case 'ê':
      return 'ee';
    case 'ô':
      return 'oo';
    case 'ơ':
      return 'ow';
    case 'ư':
      return 'uw';
    case 'đ':
      return 'dd';
    case 'Â':
      return 'AA';
    case 'Ă':
      return 'AW';
    case 'Ê':
      return 'EE';
    case 'Ô':
      return 'OO';
    case 'Ơ':
      return 'OW';
    case 'Ư':
      return 'UW';
    case 'Đ':
      return 'DD';
    default:
      return toneFreeChar;
  }
}

function applyTone(char: string, toneKey: keyof typeof TONE_INDEX): string {
  const family = getFamily(char);
  const chars = VOWEL_TABLE[family as keyof typeof VOWEL_TABLE];

  if (!chars) {
    return char;
  }

  return chars[TONE_INDEX[toneKey]];
}

function replaceLast(buffer: string[], replacement: string): string[] {
  return [...buffer.slice(0, -1), replacement];
}

function tryApplyLetterMark(buffer: string[], char: string): string[] | null {
  const previous = buffer.at(-1);

  if (!previous) {
    return null;
  }

  const lowerChar = char.toLocaleLowerCase('vi');
  const previousBase = removeTone(previous);
  const previousLower = previousBase.toLocaleLowerCase('vi');

  if (lowerChar === 'd' && previousLower === 'd') {
    const replacement = previous === previous.toUpperCase() ? 'Đ' : 'đ';
    return replaceLast(buffer, replacement);
  }

  if (lowerChar === previousLower) {
    if (previousLower === 'a') {
      return replaceLast(
        buffer,
        previous === previous.toUpperCase() ? 'Â' : 'â',
      );
    }

    if (previousLower === 'e') {
      return replaceLast(
        buffer,
        previous === previous.toUpperCase() ? 'Ê' : 'ê',
      );
    }

    if (previousLower === 'o') {
      return replaceLast(
        buffer,
        previous === previous.toUpperCase() ? 'Ô' : 'ô',
      );
    }
  }

  if (lowerChar === 'w') {
    if (previousLower === 'a') {
      return replaceLast(
        buffer,
        previous === previous.toUpperCase() ? 'Ă' : 'ă',
      );
    }

    if (previousLower === 'o') {
      return replaceLast(
        buffer,
        previous === previous.toUpperCase() ? 'Ơ' : 'ơ',
      );
    }

    if (previousLower === 'u') {
      return replaceLast(
        buffer,
        previous === previous.toUpperCase() ? 'Ư' : 'ư',
      );
    }
  }

  return null;
}

function getToneTargetIndex(
  buffer: string[],
  remainingChars: string[],
): number | null {
  const vowelIndexes = buffer
    .map((char, index) => ({ char, index }))
    .filter(({ char }) => isVowel(char))
    .map(({ index }) => index);

  if (vowelIndexes.length === 0) {
    return null;
  }

  const filteredIndexes =
    buffer[0]?.toLocaleLowerCase('vi') === 'q' &&
    getBaseFamily(buffer[1] ?? '') === 'u' &&
    vowelIndexes.length > 1
      ? vowelIndexes.filter((index) => index !== 1)
      : buffer[0]?.toLocaleLowerCase('vi') === 'g' &&
          getBaseFamily(buffer[1] ?? '') === 'i' &&
          vowelIndexes.length > 1
        ? vowelIndexes.filter((index) => index !== 1)
        : vowelIndexes;

  const indexes = filteredIndexes.length > 0 ? filteredIndexes : vowelIndexes;
  const baseFamilies = indexes.map((index) =>
    getBaseFamily(buffer[index] ?? ''),
  );

  for (const family of ['ê', 'ơ', 'ô', 'â', 'ă', 'ư']) {
    const familyIndex = baseFamilies.indexOf(family);

    if (familyIndex >= 0) {
      return indexes[familyIndex] ?? null;
    }
  }

  if (indexes.length === 1) {
    return indexes[0] ?? null;
  }

  if (indexes.length === 2) {
    const firstIndex = indexes[0] ?? null;
    const secondIndex = indexes[1] ?? null;

    if (firstIndex === null || secondIndex === null) {
      return firstIndex;
    }

    const firstFamily = getBaseFamily(buffer[firstIndex] ?? '');
    const secondFamily = getBaseFamily(buffer[secondIndex] ?? '');
    const secondIsLastCharacter =
      secondIndex === buffer.length - 1 && remainingChars.length === 0;

    if (firstFamily === 'o' && secondFamily === 'a') {
      return secondIsLastCharacter ? firstIndex : secondIndex;
    }

    return indexes[0] ?? null;
  }

  return indexes[1] ?? null;
}

function convertSyllable(segment: string): string {
  let buffer: string[] = [];
  const history: string[] = [];
  const chars = Array.from(segment);

  for (const [index, char] of chars.entries()) {
    const lowerChar = char.toLocaleLowerCase('vi');

    if (lowerChar === 'z') {
      const previous = history.pop();

      if (previous !== undefined) {
        buffer = Array.from(previous);
      } else {
        buffer.push(char);
      }

      continue;
    }

    if (isToneKey(char) && buffer.some(isVowel)) {
      const targetIndex = getToneTargetIndex(buffer, chars.slice(index + 1));

      if (targetIndex === null) {
        buffer.push(char);
        continue;
      }

      const nextChar = applyTone(
        buffer[targetIndex] ?? '',
        lowerChar as keyof typeof TONE_INDEX,
      );

      if (nextChar !== buffer[targetIndex]) {
        history.push(buffer.join(''));
        buffer = buffer.map((currentChar, index) =>
          index === targetIndex ? nextChar : currentChar,
        );
        continue;
      }
    }

    const withMark = tryApplyLetterMark(buffer, char);

    if (withMark) {
      history.push(buffer.join(''));
      buffer = withMark;
      continue;
    }

    buffer.push(char);
  }

  const toneKey = buffer.map(getToneKey).find((key) => key !== null);

  if (toneKey) {
    const normalizedBuffer = buffer.map((char) =>
      isVowel(char) ? removeTone(char) : char,
    );
    const targetIndex = getToneTargetIndex(normalizedBuffer, []);

    if (targetIndex !== null) {
      normalizedBuffer[targetIndex] = applyTone(
        normalizedBuffer[targetIndex] ?? '',
        toneKey,
      );
      buffer = normalizedBuffer;
    }
  }

  return buffer.join('');
}

export function convertTelex(input: string): string {
  const normalizedInput = normalizeVietnamese(input);
  let result = '';
  let segment = '';

  for (const char of Array.from(normalizedInput)) {
    if (isLetter(char)) {
      segment += char;
      continue;
    }

    if (segment.length > 0) {
      result += convertSyllable(segment);
      segment = '';
    }

    result += char;
  }

  if (segment.length > 0) {
    result += convertSyllable(segment);
  }

  return normalizeVietnamese(result);
}

export function convertVietnameseToTelex(input: string): string {
  let result = '';
  let segment = '';

  function flushSegment() {
    if (segment.length === 0) {
      return;
    }

    let toneKey: keyof typeof TONE_INDEX | null = null;
    let transliteratedSegment = '';

    for (const char of Array.from(segment)) {
      if (!toneKey) {
        toneKey = getToneKey(char);
      }

      transliteratedSegment += transliterateChar(char);
    }

    result += toneKey
      ? `${transliteratedSegment}${toneKey}`
      : transliteratedSegment;
    segment = '';
  }

  for (const char of Array.from(normalizeVietnamese(input))) {
    if (isLetter(char)) {
      segment += char;
      continue;
    }

    flushSegment();
    result += char;
  }

  flushSegment();

  return result;
}

export function matchesVietnameseTarget(
  input: string,
  target: string,
): boolean {
  const normalizedTarget = normalizeForComparison(target);
  const normalizedInput = normalizeForComparison(input);

  if (normalizedInput === normalizedTarget) {
    return true;
  }

  return normalizeForComparison(convertTelex(input)) === normalizedTarget;
}
