import { toUntrustedText } from './untrusted-text';

// フォーマッタがエスケープを実際の不可視文字に戻してしまうため、コードポイントで組み立てる
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x20_0b);
const RIGHT_TO_LEFT_OVERRIDE = String.fromCodePoint(0x20_2e);
const LEFT_TO_RIGHT_ISOLATE = String.fromCodePoint(0x20_66);
const BYTE_ORDER_MARK = String.fromCodePoint(0xfe_ff);
const NULL_CHAR = String.fromCodePoint(0x00);
const ESCAPE_CHAR = String.fromCodePoint(0x1b);
const DELETE_CHAR = String.fromCodePoint(0x7f);
const VARIATION_SELECTOR = String.fromCodePoint(0xe_01_00);
const toTagChars = (text: string): string =>
  Array.from(text, (char) =>
    String.fromCodePoint(0xe_00_00 + (char.codePointAt(0) ?? 0)),
  ).join('');

describe('toUntrustedText', () => {
  describe('正常系', () => {
    it('改行とタブは残す', () => {
      expect(toUntrustedText('1行目\n\t2行目', 100)).toBe('1行目\n\t2行目');
    });
  });

  describe('異常系', () => {
    it('ゼロ幅文字と双方向制御文字を取り除く', () => {
      expect(
        toUntrustedText(
          `a${ZERO_WIDTH_SPACE}b${RIGHT_TO_LEFT_OVERRIDE}c${LEFT_TO_RIGHT_ISOLATE}d${BYTE_ORDER_MARK}e`,
          100,
        ),
      ).toBe('abcde');
    });

    it('改行とタブ以外の制御文字を取り除く', () => {
      expect(
        toUntrustedText(`a${NULL_CHAR}b${ESCAPE_CHAR}c${DELETE_CHAR}d`, 100),
      ).toBe('abcd');
    });

    it('タグ文字で埋め込んだ見えない文字列を取り除く', () => {
      expect(toUntrustedText(`a${toTagChars('ignore')}b`, 100)).toBe('ab');
    });

    it('異体字セレクタを取り除く', () => {
      expect(toUntrustedText(`a${VARIATION_SELECTOR}b`, 100)).toBe('ab');
    });
  });

  describe('エッジケース', () => {
    it('取り除いた後の長さで上限に切り詰める', () => {
      expect(toUntrustedText(`${ZERO_WIDTH_SPACE}abcdef`, 3)).toBe('abc');
    });

    it('上限が絵文字の途中に来ても、サロゲートペアを分断しない', () => {
      expect(toUntrustedText('ab😀c', 3)).toBe('ab😀');
    });

    it('CRLF の CR を取り除いて LF にする', () => {
      expect(toUntrustedText('a\r\nb', 100)).toBe('a\nb');
    });
  });
});
