import { Buffer } from 'node:buffer';

import { describe, expect, it } from 'vitest';

import {
  base64UrlDecode,
  base64UrlEncode,
  base64UrlEncodeBytes,
} from './base64url';

const toB64Url = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString('base64url');

describe('base64UrlDecode', () => {
  describe('正常系', () => {
    it('base64url 文字列をバイト列に復号する', () => {
      expect(base64UrlDecode('AQID')).toStrictEqual(Uint8Array.from([1, 2, 3]));
    });

    it('URL セーフ文字(-/_)を + と / として扱う', () => {
      expect(base64UrlDecode('-_8')).toStrictEqual(Uint8Array.from([251, 255]));
    });

    it('パディング無しの文字列を復号する', () => {
      expect(base64UrlDecode('YQ')).toStrictEqual(Uint8Array.from([97]));
    });
  });

  describe('エッジケース', () => {
    it('空文字列は空のバイト列になる', () => {
      expect(base64UrlDecode('')).toStrictEqual(new Uint8Array(0));
    });

    it('encode したバイト列を decode すると元に戻る', () => {
      const bytes = Uint8Array.from([0, 1, 62, 63, 127, 128, 254, 255]);
      expect(base64UrlDecode(base64UrlEncodeBytes(bytes))).toStrictEqual(bytes);
    });
  });
});

describe('base64UrlEncode / base64UrlEncodeBytes', () => {
  describe('正常系', () => {
    it('文字列を URL セーフな base64 に符号化する', () => {
      expect(base64UrlEncode('>>>')).toBe('Pj4-');
    });

    it('パディングの = を出力しない', () => {
      expect(base64UrlEncode('a')).toBe('YQ');
    });

    it('バイト列の符号化結果が Node の base64url と一致する', () => {
      const bytes = Uint8Array.from([251, 255, 0, 62]);
      expect(base64UrlEncodeBytes(bytes)).toBe(toB64Url(bytes));
    });
  });
});
