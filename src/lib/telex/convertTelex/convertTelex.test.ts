import {
  convertTelex,
  convertVietnameseToTelex,
  matchesVietnameseTarget,
} from './convertTelex';

describe('convertTelex', () => {
  it.each([
    ['aa', 'â'],
    ['aw', 'ă'],
    ['ee', 'ê'],
    ['oo', 'ô'],
    ['ow', 'ơ'],
    ['uw', 'ư'],
    ['dd', 'đ'],
  ])('converts Vietnamese letter shortcut %s', (input, expected) => {
    expect(convertTelex(input)).toBe(expected);
  });

  it.each([
    ['as', 'á'],
    ['af', 'à'],
    ['ar', 'ả'],
    ['ax', 'ã'],
    ['aj', 'ạ'],
  ])('applies tone key for %s', (input, expected) => {
    expect(convertTelex(input)).toBe(expected);
  });

  it('handles combined vowel and tone input', () => {
    expect(convertTelex('khoer')).toBe('khỏe');
    expect(convertTelex('camr own')).toBe('cảm ơn');
    expect(convertTelex('tieesng Vieetj')).toBe('tiếng Việt');
    expect(convertTelex('loajn')).toBe('loạn');
    expect(convertTelex('ngoary')).toBe('ngoảy');
    expect(convertTelex('hoas')).toBe('hóa');
    expect(convertTelex('rowxn')).toBe('rỡn');
    expect(convertTelex('giownx')).toBe('giỡn');
  });

  it('stays correct when continuing from partially composed input', () => {
    expect(convertTelex('ngoảy')).toBe('ngoảy');
    expect(convertTelex('ngỏay')).toBe('ngoảy');
  });

  it('supports uppercase input', () => {
    expect(convertTelex('Tooi')).toBe('Tôi');
    expect(convertTelex('DDaay')).toBe('Đây');
  });

  it('preserves phrases with spaces', () => {
    expect(convertTelex('xe mays')).toBe('xe máy');
  });

  it('preserves punctuation', () => {
    expect(convertTelex('Xin chaof, Vieetj Nam!')).toBe('Xin chào, Việt Nam!');
  });

  it('returns already-composed Vietnamese unchanged', () => {
    expect(convertTelex('khỏe')).toBe('khỏe');
  });

  it('supports unicode normalization in comparison', () => {
    expect(matchesVietnameseTarget('Tiếng Việt', 'tiếng việt')).toBe(true);
  });

  it('accepts raw telex or composed Vietnamese', () => {
    expect(matchesVietnameseTarget('khoer', 'khỏe')).toBe(true);
    expect(matchesVietnameseTarget('khỏe', 'khỏe')).toBe(true);
  });

  it('removes the most recent telex mark with z', () => {
    expect(convertTelex('awz')).toBe('a');
    expect(convertTelex('asz')).toBe('a');
  });

  it('handles the documented example words', () => {
    expect(convertTelex('caf phee')).toBe('cà phê');
    expect(convertTelex('nguwowfi Anh')).toBe('người Anh');
  });

  it('converts Vietnamese text back to canonical telex', () => {
    expect(convertVietnameseToTelex('khỏe')).toBe('khoer');
    expect(convertVietnameseToTelex('cảm ơn')).toBe('camr own');
    expect(convertVietnameseToTelex('người')).toBe('nguwowif');
    expect(convertVietnameseToTelex('khoảnh khắc')).toBe('khoanhr khawcs');
  });
});
