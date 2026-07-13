import {
  createAudioHash,
  createReadableAudioSlug,
  getAudioFilename,
} from './audioFiles';

describe('audio filename helpers', () => {
  it('creates deterministic filenames', () => {
    expect(getAudioFilename('khỏe')).toBe(getAudioFilename('khỏe'));
  });

  it('normalizes to NFC before hashing', () => {
    expect(createAudioHash('cảm ơn')).toBe(
      createAudioHash('ca\u0309m o\u031Bn'),
    );
  });

  it('avoids collisions for differently accented words', () => {
    expect(createReadableAudioSlug('ma')).toBe(createReadableAudioSlug('má'));
    expect(getAudioFilename('ma')).not.toBe(getAudioFilename('má'));
  });

  it('produces a readable ascii slug with a short hash', () => {
    expect(getAudioFilename('khỏe')).toMatch(/^khoe-[0-9a-f]{8}\.mp3$/);
  });
});
