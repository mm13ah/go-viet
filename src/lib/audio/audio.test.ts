import { getAudioPath } from './audio';

describe('getAudioPath', () => {
  it('returns null when audio has not been generated', () => {
    expect(getAudioPath('word definitely not in manifest')).toBeNull();
  });

  it('matches audio generated from older tone-placement spellings', () => {
    expect(getAudioPath('thác loạn')).toBe('/audio/thac-loan-a40a346f.mp3');
    expect(getAudioPath('khoảnh khắc')).toBe('/audio/khoanh-khac-7e139ad5.mp3');
  });
});
