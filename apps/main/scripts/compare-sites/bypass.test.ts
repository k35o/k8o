import { describe, expect, it } from 'vitest';

import { bypassHeaders, readBypassSecret, sendsBypassTo } from './bypass';

// 形だけを合わせた偽の値。本物の値は使わない
const FAKE_SECRET = 'fake'.repeat(8);
const PREVIEW = 'https://main-abc123-k35o.vercel.app';

const thrownBy = (run: () => unknown): Error => {
  try {
    run();
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }
  }
  throw new Error('止まらなかった');
};

describe('sendsBypassTo', () => {
  describe('正常系', () => {
    it('https の *.vercel.app に送る', () => {
      expect(sendsBypassTo(`${PREVIEW}/blog/abs-sign.md`)).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('本番・手元・vercel.app に似た名前・http には送らない', () => {
      expect(sendsBypassTo('https://k8o.me/blog')).toBe(false);
      expect(sendsBypassTo('http://127.0.0.1:4511/')).toBe(false);
      expect(sendsBypassTo('https://vercel.app.example.com/')).toBe(false);
      expect(sendsBypassTo('https://evilvercel.app/')).toBe(false);
      expect(sendsBypassTo('http://main-abc123-k35o.vercel.app/')).toBe(false);
    });
  });
});

describe('readBypassSecret', () => {
  describe('正常系', () => {
    it('*.vercel.app を比べるなら、形の合う値を返す', () => {
      expect(readBypassSecret(['https://k8o.me', PREVIEW], FAKE_SECRET)).toBe(
        FAKE_SECRET,
      );
    });

    it('*.vercel.app を比べないなら、値を読まない', () => {
      expect(
        readBypassSecret(
          ['https://k8o.me', 'http://127.0.0.1:4511'],
          `${FAKE_SECRET}\n`,
        ),
      ).toBeNull();
    });
  });

  describe('異常系', () => {
    it('値が無ければ、env の名前を出して止める', () => {
      expect(() => readBypassSecret([PREVIEW], undefined)).toThrowError(
        'K8O_MAIN_PREVIEW_BYPASS',
      );
      expect(() => readBypassSecret([PREVIEW], '')).toThrowError(
        'K8O_MAIN_PREVIEW_BYPASS',
      );
    });

    it.each([
      ['末尾に改行がある', `${FAKE_SECRET}\n`],
      ['前後に空白がある', ` ${FAKE_SECRET} `],
      ['名前ごと貼った', `K8O_MAIN_PREVIEW_BYPASS=${FAKE_SECRET}`],
      ['引用符で囲んだ', `"${FAKE_SECRET}"`],
      ['1字足りない', FAKE_SECRET.slice(1)],
      ['記号を含む', `${FAKE_SECRET.slice(1)}-`],
    ])('%s値なら、値を出さずに止める', (_, value) => {
      const error = thrownBy(() => readBypassSecret([PREVIEW], value));

      expect(error.message).toContain('K8O_MAIN_PREVIEW_BYPASS');
      expect(error.message).not.toContain(FAKE_SECRET.slice(1, -1));
      expect(error.stack).not.toContain(FAKE_SECRET.slice(1, -1));
      expect(error.cause).toBeUndefined();
    });
  });
});

describe('bypassHeaders', () => {
  describe('正常系', () => {
    it('*.vercel.app への要求にだけヘッダーを付ける', () => {
      expect(bypassHeaders(`${PREVIEW}/`, FAKE_SECRET)).toStrictEqual({
        'x-vercel-protection-bypass': FAKE_SECRET,
      });
      expect(bypassHeaders('https://k8o.me/', FAKE_SECRET)).toStrictEqual({});
      expect(
        bypassHeaders('https://www.k8o.me/blog?x=1', FAKE_SECRET),
      ).toStrictEqual({});
    });
  });

  describe('エッジケース', () => {
    it('値が無ければ何も付けない', () => {
      expect(bypassHeaders(`${PREVIEW}/`, null)).toStrictEqual({});
    });
  });
});
