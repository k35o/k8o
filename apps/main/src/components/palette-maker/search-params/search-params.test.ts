import { describe, expect, it } from 'vitest';

import {
  isTokenName,
  paletteMakerState,
  readPaletteUrl,
} from './search-params';

const readQuery = (query: string) =>
  readPaletteUrl(paletteMakerState.parseUrl(new URLSearchParams(query)));

const readHue = (value: string) =>
  readPaletteUrl(paletteMakerState.parseUrl({ h: value })).hue;

const readChroma = (value: string) =>
  readPaletteUrl(paletteMakerState.parseUrl({ c: value })).chroma;

const readName = (value: string) =>
  readPaletteUrl(paletteMakerState.parseUrl({ name: value })).name;

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

describe('paletteMakerState の URL の読み', () => {
  describe('正常系', () => {
    it('キーが無ければ既定の値になる', () => {
      expect(readQuery('')).toStrictEqual({
        hue: 250,
        chroma: 0.12,
        name: 'primary',
      });
    });

    it.each([
      ['250', 250],
      ['30', 30],
      ['0', 0],
      ['360', 360],
      ['+30', 30],
      ['.5', 0.5],
    ])('h=%s は %d と読む', (input, expected) => {
      expect(readHue(input)).toBe(expected);
    });

    it.each([
      ['0.12', 0.12],
      ['0.2', 0.2],
      ['0', 0],
      ['0.4', 0.4],
      ['.3', 0.3],
      ['1e-1', 0.1],
    ])('c=%s は %d と読む', (input, expected) => {
      expect(readChroma(input)).toBe(expected);
    });

    it.each(['primary', 'brand', 'a-b', 'brand-2', 'a'.repeat(32)])(
      'name=%s はそのまま読む',
      (input) => {
        expect(readName(input)).toBe(input);
      },
    );
  });

  describe('異常系', () => {
    it.each(['abc', '', 'NaN'])('h=%j は既定の 250 になる', (input) => {
      expect(readHue(input)).toBe(250);
    });

    it.each(['abc', ''])('c=%j は既定の 0.12 になる', (input) => {
      expect(readChroma(input)).toBe(0.12);
    });

    it.each([
      'Bad',
      '1abc',
      '-x',
      'x-',
      'a--b',
      'a_b',
      '',
      'a b',
      'a'.repeat(33),
    ])('name=%j は既定の primary になる', (input) => {
      expect(readName(input)).toBe('primary');
    });

    it('壊れたキーだけが既定になり、ほかのキーは残る', () => {
      expect(readQuery('h=abc&c=0.2&name=Bad')).toStrictEqual({
        hue: 250,
        chroma: 0.2,
        name: 'primary',
      });
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['400', 360],
      ['-5', 0],
      ['Infinity', 360],
      ['-Infinity', 0],
    ])('範囲の外の h=%s は端の %d に丸める', (input, expected) => {
      expect(readHue(input)).toBe(expected);
    });

    it.each([
      ['0.5', 0.4],
      ['-1', 0],
    ])('範囲の外の c=%s は端の %d に丸める', (input, expected) => {
      expect(readChroma(input)).toBe(expected);
    });

    it.each(['12abc', '30,5'])(
      '数にならない h=%j は既定の 250 になる',
      (input) => {
        expect(readHue(input)).toBe(250);
      },
    );

    it.each([
      ['0x10', 16],
      ['1e2', 100],
      [' 30', 30],
      ['30 ', 30],
      ['-0', 0],
    ])('h=%j は数として %d と読む', (input, expected) => {
      expect(readHue(input)).toBe(expected);
    });

    it('読むときは小数の桁を丸めない', () => {
      expect(readHue('30.55')).toBe(30.55);
      expect(readChroma('0.12345')).toBe(0.12345);
    });

    it('パーセントで書いた値は戻してから読む', () => {
      expect(readQuery('h=%33%30').hue).toBe(30);
    });

    it('同じキーが複数あれば最初の値を読む', () => {
      expect(readQuery('h=30&h=40').hue).toBe(30);
      expect(readQuery('h=abc&h=40').hue).toBe(250);
    });
  });
});

describe('paletteMakerState の URL の書き', () => {
  describe('正常系', () => {
    it('定義のキーの順で書く', () => {
      expect(
        paletteMakerState.search({ name: 'brand', c: '0.2', h: '30' }),
      ).toBe('h=30&c=0.2&name=brand');
    });

    it.each([
      { h: '30.5', c: '0.123', name: 'brand-2' },
      { h: '0', c: '0', name: 'a' },
      { h: '360', c: '0.4', name: 'a'.repeat(32) },
    ])('書いた値を読み返せる: %j', (values) => {
      expect(
        paletteMakerState.parseUrl(
          new URLSearchParams(paletteMakerState.search(values)),
        ),
      ).toStrictEqual(values);
    });
  });

  describe('エッジケース', () => {
    it('既定の値は書かない', () => {
      expect(
        paletteMakerState.search({ h: '250', c: '0.12', name: 'primary' }),
      ).toBe('');
    });

    it('範囲の外や壊れた値は読むときだけ解き、URL の文字列は残る', () => {
      expect(
        paletteMakerState.search(
          paletteMakerState.parseUrl(
            new URLSearchParams('h=400&c=abc&name=Bad'),
          ),
        ),
      ).toBe('h=400&c=abc&name=Bad');
    });
  });
});
