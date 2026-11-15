import { describe, expect, it } from 'vitest';

import { parseDemoName } from './demo.ts';

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
