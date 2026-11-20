import { describe, expect, it } from 'vitest';

import { withDemoOrigin } from './demo-origin';

describe('withDemoOrigin', () => {
  describe('正常系', () => {
    it('文書の CSP の origin の置き場を、渡した origin に置き換える', () => {
      expect(
        withDemoOrigin(
          '<meta content="img-src https://k8o-demo-origin.invalid blob:; media-src https://k8o-demo-origin.invalid;">',
          'https://k8o.me',
        ),
      ).toBe(
        '<meta content="img-src https://k8o.me blob:; media-src https://k8o.me;">',
      );
    });
  });

  describe('エッジケース', () => {
    it('置き場の無い文書はそのまま返す', () => {
      expect(withDemoOrigin('<p>例</p>', 'https://k8o.me')).toBe('<p>例</p>');
    });
  });
});
