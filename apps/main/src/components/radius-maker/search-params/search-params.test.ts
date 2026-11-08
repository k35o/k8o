import { describe, expect, it } from 'vitest';

import {
  parseCorners,
  radiusMakerState,
  readRadiusUrl,
  serializeCorners,
} from './search-params';

const readWidth = (value: string) =>
  readRadiusUrl(radiusMakerState.parseUrl({ w: value })).width;

const readHeight = (value: string) =>
  readRadiusUrl(radiusMakerState.parseUrl({ h: value })).height;

const readShape = (value: string) => radiusMakerState.parseUrl({ s: value }).s;

const readCorners = (value: string) =>
  readRadiusUrl(radiusMakerState.parseUrl({ r: value })).corners;

const DEFAULT_R = '30,30,70,30,70,70,30,70';

const BLOB = {
  topLeft: { x: 30, y: 30 },
  topRight: { x: 70, y: 30 },
  bottomRight: { x: 70, y: 70 },
  bottomLeft: { x: 30, y: 70 },
};

const CORNERS = {
  topLeft: { x: 10, y: 20 },
  topRight: { x: 30, y: 40 },
  bottomRight: { x: 50, y: 60 },
  bottomLeft: { x: 70, y: 80 },
};

describe('parseCorners', () => {
  describe('正常系', () => {
    it('カンマ区切りの8値をRadiusCornersに変換する', () => {
      expect(parseCorners('10,20,30,40,50,60,70,80')).toStrictEqual(CORNERS);
    });

    it('serializeCornersと往復できる', () => {
      const query = '10,20,30,40,50,60,70,80';
      expect(serializeCorners(CORNERS)).toBe(query);
      expect(parseCorners(query)).toStrictEqual(CORNERS);
    });
  });

  describe('異常系', () => {
    it('値の個数が8でない場合はnullを返す', () => {
      expect(parseCorners('10,20,30')).toBeNull();
      expect(parseCorners('10,20,30,40,50,60,70,80,90')).toBeNull();
    });

    it('範囲外や数値でない値が含まれる場合はnullを返す', () => {
      expect(parseCorners('10,20,30,40,50,60,70,101')).toBeNull();
      expect(parseCorners('10,20,30,40,50,60,70,-1')).toBeNull();
      expect(parseCorners('10,20,30,40,50,60,70,abc')).toBeNull();
      expect(parseCorners('10,20,30,40,50,60,70,8.5')).toBeNull();
    });
  });
});

describe('radiusMakerState の URL の読み', () => {
  describe('正常系', () => {
    it('キーが無ければ既定の値になる', () => {
      const url = radiusMakerState.parseUrl(new URLSearchParams());
      expect(readRadiusUrl(url)).toStrictEqual({
        corners: BLOB,
        width: 192,
        height: 192,
      });
      expect(url.s).toBe('round');
    });

    it.each([
      ['192', 192],
      ['100', 100],
      ['80', 80],
      ['320', 320],
    ])('w=%s は %d と読む', (input, expected) => {
      expect(readWidth(input)).toBe(expected);
    });

    it.each([
      ['192', 192],
      ['150', 150],
    ])('h=%s は %d と読む', (input, expected) => {
      expect(readHeight(input)).toBe(expected);
    });

    it.each(['round', 'squircle', 'bevel', 'scoop', 'notch'])(
      's=%s はそのまま読む',
      (input) => {
        expect(readShape(input)).toBe(input);
      },
    );

    it.each([
      [DEFAULT_R, BLOB],
      ['10,20,30,40,50,60,70,80', CORNERS],
    ])('r=%s を 8 値として読む', (input, expected) => {
      expect(readCorners(input)).toStrictEqual(expected);
    });
  });

  describe('異常系', () => {
    it.each(['abc', '', 'Infinity'])('w=%j は既定の 192 になる', (input) => {
      expect(readWidth(input)).toBe(192);
    });

    it.each(['abc', ''])('h=%j は既定の 192 になる', (input) => {
      expect(readHeight(input)).toBe(192);
    });

    it.each(['foo', 'ROUND', ''])('s=%j は既定の round になる', (input) => {
      expect(readShape(input)).toBe('round');
    });

    it.each([
      '1,2',
      '10,20,30,40,50,60,70,80,90',
      '10,20,30,40,50,60,70,101',
      '10,20,30,40,50,60,70,-1',
      '10,20,30,40,50,60,70,abc',
      '10,20,30,40,50,60,70,8.5',
      '',
    ])('r=%j は全体が既定になる', (input) => {
      expect(readCorners(input)).toStrictEqual(BLOB);
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['10', 80],
      ['1000', 320],
      ['-5', 80],
    ])('範囲の外の w=%s は端の %d に丸める', (input, expected) => {
      expect(readWidth(input)).toBe(expected);
    });

    it.each([
      ['10', 80],
      ['1000', 320],
    ])('範囲の外の h=%s は端の %d に丸める', (input, expected) => {
      expect(readHeight(input)).toBe(expected);
    });

    it.each(['100.7', '100.2', '12abc'])(
      '整数にならない w=%j は既定の 192 になる',
      (input) => {
        expect(readWidth(input)).toBe(192);
      },
    );

    it.each([
      ['1e2', 100],
      ['0x100', 256],
      [' 100', 100],
    ])('w=%j は整数として %d と読む', (input, expected) => {
      expect(readWidth(input)).toBe(expected);
    });

    it('h も整数にならなければ既定の 192 になる', () => {
      expect(readHeight('100.7')).toBe(192);
    });

    it.each([
      ['010,20,30,40,50,60,70,80', CORNERS],
      ['1e1,20,30,40,50,60,70,80', CORNERS],
      [' 10,20,30,40,50,60,70,80', CORNERS],
      ['0x10,20,30,40,50,60,70,80', { ...CORNERS, topLeft: { x: 16, y: 20 } }],
    ])('r=%j は Number で読める値として通す', (input, expected) => {
      expect(readCorners(input)).toStrictEqual(expected);
    });

    it('r=,,,,,,, は全部 0 として通す', () => {
      expect(readCorners(',,,,,,,')).toStrictEqual({
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0, y: 0 },
        bottomRight: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 0 },
      });
    });

    it('r は , でも %2C でも同じに読む', () => {
      const read = (query: string) =>
        readRadiusUrl(radiusMakerState.parseUrl(new URLSearchParams(query)))
          .corners;
      expect(read('r=10%2C20%2C30%2C40%2C50%2C60%2C70%2C80')).toStrictEqual(
        CORNERS,
      );
      expect(read('r=10,20,30,40,50,60,70,80')).toStrictEqual(CORNERS);
    });
  });
});

describe('radiusMakerState の URL の書き', () => {
  describe('正常系', () => {
    it('定義のキーの順で書き、r の , は %2C になる', () => {
      expect(
        radiusMakerState.search({
          s: 'bevel',
          h: '100',
          w: '300',
          r: '10,20,30,40,50,60,70,80',
        }),
      ).toBe('r=10%2C20%2C30%2C40%2C50%2C60%2C70%2C80&w=300&h=100&s=bevel');
    });

    it.each([
      { r: '10,20,30,40,50,60,70,80', w: '100', h: '320', s: 'bevel' as const },
      { r: '0,0,0,0,0,0,0,0', w: '80', h: '81', s: 'notch' as const },
    ])('書いた値を読み返せる: %j', (values) => {
      expect(
        radiusMakerState.parseUrl(
          new URLSearchParams(radiusMakerState.search(values)),
        ),
      ).toStrictEqual(values);
    });
  });

  describe('エッジケース', () => {
    it('既定の値は書かない', () => {
      expect(
        radiusMakerState.search({
          r: DEFAULT_R,
          w: '192',
          h: '192',
          s: 'round',
        }),
      ).toBe('');
    });

    it('範囲の外や壊れた値は読むときだけ解き、URL の文字列は残る', () => {
      expect(
        radiusMakerState.search(
          radiusMakerState.parseUrl(new URLSearchParams('r=1,2&w=10&h=abc')),
        ),
      ).toBe('r=1%2C2&w=10&h=abc');
    });

    it('s は定義に無ければ読むときに既定になる', () => {
      expect(radiusMakerState.parseUrl(new URLSearchParams('s=foo')).s).toBe(
        'round',
      );
    });
  });
});
