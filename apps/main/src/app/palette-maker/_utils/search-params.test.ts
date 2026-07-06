import { isTokenName, paletteMakerParsers } from './search-params';

describe('isTokenName', () => {
  it('小文字英数字とハイフン区切りを許容する', () => {
    expect(isTokenName('primary')).toBe(true);
    expect(isTokenName('brand-2')).toBe(true);
    expect(isTokenName('a1-b2-c3')).toBe(true);
  });

  it('大文字・数字始まり・記号・空文字を拒否する', () => {
    expect(isTokenName('Primary')).toBe(false);
    expect(isTokenName('1abc')).toBe(false);
    expect(isTokenName('-x')).toBe(false);
    expect(isTokenName('x-')).toBe(false);
    expect(isTokenName('a--b')).toBe(false);
    expect(isTokenName('a_b')).toBe(false);
    expect(isTokenName('')).toBe(false);
  });

  it('32文字以内のみ許容する', () => {
    expect(isTokenName('a'.repeat(32))).toBe(true);
    expect(isTokenName('a'.repeat(33))).toBe(false);
  });
});

describe('nameParser', () => {
  const { parse, serialize } = paletteMakerParsers.name;

  it('有効なトークン名はそのまま返す', () => {
    expect(parse('brand')).toBe('brand');
  });

  it('不正なトークン名はnullを返しデフォルトへフォールバックさせる', () => {
    expect(parse('Brand')).toBeNull();
    expect(parse('a b')).toBeNull();
  });

  it('serializeと往復できる', () => {
    expect(parse(serialize('brand-accent'))).toBe('brand-accent');
  });
});
