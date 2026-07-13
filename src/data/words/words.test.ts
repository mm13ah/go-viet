import {
  isTrainerSafeWord,
  normalizeTrainerEntry,
  parseTrainerWords,
} from './words';

describe('parseTrainerWords', () => {
  it('filters short entries and removes duplicates', () => {
    expect(parseTrainerWords('a\ná\nai\năn\nkhỏe\nkhỏe\nxin lỗi')).toEqual([
      'khỏe',
      'xin lỗi',
    ]);
  });

  it('filters obvious loanwords and non-trainer entries', () => {
    expect(isTrainerSafeWord('caffein')).toBe(false);
    expect(isTrainerSafeWord('acid')).toBe(false);
    expect(isTrainerSafeWord('moóc')).toBe(false);
    expect(isTrainerSafeWord('rơ moóc')).toBe(false);
    expect(isTrainerSafeWord('euro')).toBe(false);
    expect(isTrainerSafeWord('video')).toBe(false);
    expect(isTrainerSafeWord('logic')).toBe(false);
    expect(isTrainerSafeWord('xe buýt')).toBe(false);
    expect(isTrainerSafeWord('mô tô')).toBe(false);
    expect(isTrainerSafeWord('a-xít')).toBe(false);
    expect(isTrainerSafeWord('hđnd')).toBe(false);
    expect(isTrainerSafeWord('ubnd')).toBe(false);
    expect(isTrainerSafeWord('anh')).toBe(true);
    expect(isTrainerSafeWord('xin lỗi')).toBe(true);
  });

  it('normalizes older tone placement to modern trainer spelling', () => {
    expect(normalizeTrainerEntry('hoá')).toBe('hóa');
    expect(normalizeTrainerEntry('khoẻ')).toBe('khỏe');
    expect(normalizeTrainerEntry('bánh khóai')).toBe('bánh khoái');
    expect(normalizeTrainerEntry('khỏanh khắc')).toBe('khoảnh khắc');
    expect(normalizeTrainerEntry('thuỷ')).toBe('thủy');
    expect(normalizeTrainerEntry('thác lọan')).toBe('thác loạn');
    expect(
      parseTrainerWords('hoá\nkhoẻ\nbánh khóai\nkhỏanh khắc\nthủy\nthác lọan'),
    ).toEqual([
      'hóa',
      'khỏe',
      'bánh khoái',
      'khoảnh khắc',
      'thủy',
      'thác loạn',
    ]);
  });
});
