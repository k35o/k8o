import { describe, expect, it } from 'vitest';

import { gaEventsOf, speedInsightsMetricsOf } from './beacons';

describe('gaEventsOf', () => {
  describe('正常系', () => {
    it('本文が無ければ、URL の en と dl を1つのイベントにする', () => {
      expect(
        gaEventsOf(
          'https://region1.google-analytics.com/g/collect?v=2&en=page_view&dl=https%3A%2F%2Fk8o.me%2Fblog',
          null,
        ),
      ).toStrictEqual([{ name: 'page_view', location: 'https://k8o.me/blog' }]);
    });

    it('まとめて送る本文は、行ごとのイベントにし、行に無い値は URL から補う', () => {
      expect(
        gaEventsOf(
          'https://region1.google-analytics.com/g/collect?v=2&dl=https%3A%2F%2Fk8o.me%2F',
          'en=page_view&dl=https%3A%2F%2Fk8o.me%2Fblog%2Fabs-sign\nen=user_engagement\n',
        ),
      ).toStrictEqual([
        { name: 'page_view', location: 'https://k8o.me/blog/abs-sign' },
        { name: 'user_engagement', location: 'https://k8o.me/' },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('en も dl も無ければ null にする', () => {
      expect(
        gaEventsOf('https://region1.google-analytics.com/g/collect?v=2', ''),
      ).toStrictEqual([{ name: null, location: null }]);
    });
  });
});

describe('speedInsightsMetricsOf', () => {
  describe('正常系', () => {
    it('metrics の種類・route・href を並べる', () => {
      const body = JSON.stringify({
        speed: '4g',
        metrics: [
          {
            id: 'v1',
            type: 'FCP',
            route: '/',
            href: 'https://k8o.me/',
            value: 1,
          },
          { id: 'v2', type: 'INP', href: 'https://k8o.me/blog', value: 2 },
        ],
      });

      expect(speedInsightsMetricsOf(body)).toStrictEqual([
        { type: 'FCP', route: '/', href: 'https://k8o.me/' },
        { type: 'INP', route: null, href: 'https://k8o.me/blog' },
      ]);
    });
  });

  describe('異常系', () => {
    it.each([
      ['本文が無い', null],
      ['JSON でない', 'metrics'],
      ['形が違う', JSON.stringify({ metrics: 'FCP' })],
    ])('%s なら空にする', (_, body) => {
      expect(speedInsightsMetricsOf(body)).toStrictEqual([]);
    });
  });
});
