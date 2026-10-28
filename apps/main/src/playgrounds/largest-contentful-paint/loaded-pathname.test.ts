import { describe, expect, it } from 'vitest';

import { findOtherLoadedPathname } from './loaded-pathname';

describe('findOtherLoadedPathname', () => {
  describe('正常系', () => {
    it('文書を読み込んだ URL と pathname が同じなら null を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/blog/largest-contentful-paint',
          '/blog/largest-contentful-paint',
        ),
      ).toBeNull();
    });

    it('pathname が違えば、文書を読み込んだ pathname を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/playgrounds',
          '/playgrounds/largest-contentful-paint',
        ),
      ).toBe('/playgrounds');
    });
  });

  describe('異常系', () => {
    it('navigation の entry が無ければ null を返す', () => {
      expect(
        findOtherLoadedPathname(undefined, '/blog/largest-contentful-paint'),
      ).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('search だけが違うなら null を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/blog/largest-contentful-paint?ref=top',
          '/blog/largest-contentful-paint',
        ),
      ).toBeNull();
    });

    it('hash だけが違うなら null を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/blog/largest-contentful-paint#基本的な使い方',
          '/blog/largest-contentful-paint',
        ),
      ).toBeNull();
    });

    it('読み込んだ URL にだけ末尾のスラッシュがあるなら null を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/playgrounds/largest-contentful-paint/',
          '/playgrounds/largest-contentful-paint',
        ),
      ).toBeNull();
    });

    it('今の pathname にだけ末尾のスラッシュがあるなら null を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/playgrounds/largest-contentful-paint',
          '/playgrounds/largest-contentful-paint/',
        ),
      ).toBeNull();
    });

    it('トップページから移ってきたなら / を返す', () => {
      expect(
        findOtherLoadedPathname(
          'https://k8o.me/',
          '/blog/largest-contentful-paint',
        ),
      ).toBe('/');
    });
  });
});
