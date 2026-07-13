import {
  normalizeForComparison,
  normalizeVietnamese,
} from './normalizeVietnamese';

describe('normalizeVietnamese', () => {
  it('normalizes composed characters to NFC', () => {
    expect(normalizeVietnamese('Tiếng Việt')).toBe('Tiếng Việt');
  });

  it('trims and compares case-insensitively', () => {
    expect(normalizeForComparison('  Tiếng Việt  ')).toBe('tiếng việt');
  });
});
