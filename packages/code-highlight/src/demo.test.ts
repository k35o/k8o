import { describe, expect, it } from 'vitest';

import { parseDemoAllow, parseDemoName } from './demo.ts';

describe('parseDemoName', () => {
  describe('正常系', () => {
    it('demo="..." の名前を返す', () => {
      expect(parseDemoName('demo="dots"')).toBe('dots');
    });

    it("シングルクォートの demo='...' も読む", () => {
      expect(parseDemoName("demo='dots-from-center'")).toBe('dots-from-center');
    });

    it('ほかのメタと並べても読む', () => {
      expect(parseDemoName('title="index.html" demo="dots"')).toBe('dots');
    });
  });

  describe('異常系', () => {
    it('URL の区間にできない名前は投げる', () => {
      expect(() => parseDemoName('demo="Dots"')).toThrow(/demo="Dots"/u);
      expect(() => parseDemoName('demo="a/b"')).toThrow(/demo の名前は/u);
      expect(() => parseDemoName('demo=""')).toThrow(/demo の名前は/u);
    });
  });

  describe('エッジケース', () => {
    it('メタが無い、または demo を含まないときは undefined を返す', () => {
      expect(parseDemoName(undefined)).toBeUndefined();
      expect(parseDemoName(null)).toBeUndefined();
      expect(parseDemoName('title="a.css"')).toBeUndefined();
    });

    it('data-demo のように demo で終わる別の名前は読まない', () => {
      expect(parseDemoName('data-demo="dots"')).toBeUndefined();
    });
  });
});

describe('parseDemoAllow', () => {
  describe('正常系', () => {
    it('allow="..." の権限を、空白で区切って返す', () => {
      expect(
        parseDemoAllow('demo="copy" allow="clipboard-read clipboard-write"'),
      ).toStrictEqual(['clipboard-read', 'clipboard-write']);
    });

    it("シングルクォートの allow='...' も読む", () => {
      expect(
        parseDemoAllow("demo='lock' allow='screen-wake-lock'"),
      ).toStrictEqual(['screen-wake-lock']);
    });
  });

  describe('異常系', () => {
    it('決めた権限のほかは投げる', () => {
      expect(() => parseDemoAllow('demo="cam" allow="camera"')).toThrow(
        /allow="camera"/u,
      );
      expect(() =>
        parseDemoAllow('demo="copy" allow="clipboard-read; clipboard-write"'),
      ).toThrow(/allow="clipboard-read;"/u);
    });
  });

  describe('エッジケース', () => {
    it('メタが無い、または allow を含まないときは空を返す', () => {
      expect(parseDemoAllow(undefined)).toStrictEqual([]);
      expect(parseDemoAllow(null)).toStrictEqual([]);
      expect(parseDemoAllow('demo="dots"')).toStrictEqual([]);
    });

    it('data-allow のように allow で終わる別の名前は読まない', () => {
      expect(parseDemoAllow('data-allow="camera"')).toStrictEqual([]);
    });
  });
});
