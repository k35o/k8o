import { END_OF_CONTENT_ID } from '../constants';
import {
  ACTIVE_LINE_OFFSET,
  resolveActiveHeading,
} from './resolve-active-heading';
import type { HeadingMeasurement } from './resolve-active-heading';

const heading = (
  id: string,
  top: number,
  overrides?: Partial<HeadingMeasurement>,
): HeadingMeasurement => ({
  id,
  top,
  isRendered: true,
  isInsideEndOfContent: false,
  ...overrides,
});

describe('resolveActiveHeading', () => {
  describe('正常系', () => {
    it('読み取りラインを最後に通過した見出しを現在地にする', () => {
      const result = resolveActiveHeading(
        [
          heading('はじめに', -500),
          heading('使い方', 50),
          heading('おわりに', 800),
        ],
        false,
      );

      expect(result).toBe('使い方');
    });

    it('どの見出しもラインに達していなければ現在地なし', () => {
      const result = resolveActiveHeading(
        [heading('はじめに', 400), heading('おわりに', 900)],
        false,
      );

      expect(result).toBe('');
    });

    it('速いスクロールで全見出しがラインを飛び越えても末尾の見出しを現在地にする', () => {
      const result = resolveActiveHeading(
        [
          heading('はじめに', -900),
          heading('使い方', -500),
          heading('おわりに', -100),
        ],
        false,
      );

      expect(result).toBe('おわりに');
    });

    it('ページ最下部ではEND_OF_CONTENTを現在地にする', () => {
      const result = resolveActiveHeading(
        [
          heading('はじめに', -500),
          heading('おわりに', -100),
          heading(END_OF_CONTENT_ID, 300),
        ],
        true,
      );

      expect(result).toBe(END_OF_CONTENT_ID);
    });
  });

  describe('エッジケース', () => {
    it('記事末尾ブロック内の見出しは現在地にしない', () => {
      const result = resolveActiveHeading(
        [
          heading('おわりに', -300),
          heading(END_OF_CONTENT_ID, 200),
          heading('関連記事', 80, { isInsideEndOfContent: true }),
        ],
        false,
      );

      expect(result).toBe('おわりに');
    });

    it('未レンダリングの見出しは現在地にしない', () => {
      const result = resolveActiveHeading(
        [
          heading('はじめに', -500),
          heading('未描画', 0, { isRendered: false }),
        ],
        false,
      );

      expect(result).toBe('はじめに');
    });

    it('ちょうどライン上の見出しは現在地にする', () => {
      const result = resolveActiveHeading(
        [heading('はじめに', ACTIVE_LINE_OFFSET)],
        false,
      );

      expect(result).toBe('はじめに');
    });

    it('最下部でEND_OF_CONTENTが無ければ末尾の見出しを現在地にする', () => {
      const result = resolveActiveHeading(
        [heading('はじめに', -500), heading('おわりに', 400)],
        true,
      );

      expect(result).toBe('おわりに');
    });

    it('見出しが無ければ現在地なし', () => {
      expect(resolveActiveHeading([], true)).toBe('');
    });
  });
});
