import { describe, expect, it } from 'vitest';

import { blockedCategoryOf, bypassHeadersFor } from './requests';

// 形だけを合わせた偽の値。本物の値は使わない
const FAKE_SECRET = 'fake'.repeat(8);
const PREVIEW = 'https://main-abc123-k35o.vercel.app';

describe('blockedCategoryOf', () => {
  describe('正常系', () => {
    it.each([
      ['POST', 'https://api.k8o.me/public/blogs/abs-sign/views'],
      ['POST', 'https://api.k8o.me/public/reports'],
      ['DELETE', 'https://api.k8o.me/public/push-subscriptions'],
    ])('api への %s %s を止める', (method, url) => {
      expect(blockedCategoryOf(method, url)).toBe('api');
    });

    it.each([
      'https://region1.google-analytics.com/g/collect?v=2&en=page_view',
      'https://www.google-analytics.com/g/collect?v=2',
      'https://google-analytics.com/collect',
      'https://region1.analytics.google.com/g/collect?v=2',
    ])('GA の %s を止める', (url) => {
      expect(blockedCategoryOf('POST', url)).toBe('ga');
    });

    it.each([
      'https://k8o.me/_vercel/speed-insights/vitals',
      'https://main-abc123-k35o.vercel.app/_vercel/speed-insights/vitals',
      'http://127.0.0.1:4511/_vercel/speed-insights/vitals',
    ])('Speed Insights の %s を止める', (url) => {
      expect(blockedCategoryOf('POST', url)).toBe('speed-insights');
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['GET', 'https://api.k8o.me/public/reading-list'],
      ['HEAD', 'https://api.k8o.me/public/browser-support'],
      ['OPTIONS', 'https://api.k8o.me/public/reports'],
    ])('api の読み取りとプリフライト（%s %s）は止めない', (method, url) => {
      expect(blockedCategoryOf(method, url)).toBeNull();
    });

    it.each([
      ['GET', 'https://www.googletagmanager.com/gtag/js?id=G-TEST'],
      ['GET', 'https://k8o.me/_vercel/speed-insights/script.js'],
      ['POST', 'https://api.k8o.me.example.com/public/reports'],
      ['POST', 'https://evil-google-analytics.com/g/collect'],
      ['GET', 'https://k8o.me/blog/abs-sign'],
    ])('ほかの要求（%s %s）は止めない', (method, url) => {
      expect(blockedCategoryOf(method, url)).toBeNull();
    });
  });
});

describe('bypassHeadersFor', () => {
  describe('正常系', () => {
    it('宛先の preview への要求にだけ bypass のヘッダーを付ける', () => {
      expect(
        bypassHeadersFor(
          `${PREVIEW}/_next/static/app.js`,
          PREVIEW,
          FAKE_SECRET,
        ),
      ).toStrictEqual({ 'x-vercel-protection-bypass': FAKE_SECRET });
    });
  });

  describe('エッジケース', () => {
    it('宛先でないオリジンには、*.vercel.app でも付けない', () => {
      expect(
        bypassHeadersFor(
          'https://other-k35o.vercel.app/x.js',
          PREVIEW,
          FAKE_SECRET,
        ),
      ).toStrictEqual({});
      expect(
        bypassHeadersFor(
          'https://www.googletagmanager.com/gtag/js?id=G-TEST',
          PREVIEW,
          FAKE_SECRET,
        ),
      ).toStrictEqual({});
    });

    it('宛先が本番なら付けない', () => {
      expect(
        bypassHeadersFor('https://k8o.me/', 'https://k8o.me', FAKE_SECRET),
      ).toStrictEqual({});
    });

    it('値が無ければ付けない', () => {
      expect(bypassHeadersFor(`${PREVIEW}/`, PREVIEW, null)).toStrictEqual({});
    });
  });
});
