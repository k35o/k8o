import { describe, expect, it } from 'vitest';

import { indexOfLinkToFollow } from './navigation';

const linkTo = (
  href: string,
  {
    target = '',
    download = false,
  }: { target?: string; download?: boolean } = {},
): { href: string; target: string; download: boolean } => ({
  href,
  target,
  download,
});

describe('indexOfLinkToFollow', () => {
  describe('正常系', () => {
    it('トップでは、<main> の最初の内部リンク（最新の記事のカード）を選ぶ', () => {
      expect(
        indexOfLinkToFollow(
          [
            linkTo('/blog/revert-rule'),
            linkTo('/blog/animation-accessors'),
            linkTo('/blog'),
            linkTo('/talks'),
          ],
          'https://k8o.me/',
        ),
      ).toBe(0);
    });

    it('Playground の一覧では、最初のカードを選ぶ', () => {
      expect(
        indexOfLinkToFollow(
          [
            linkTo('/playgrounds/details-content'),
            linkTo('/playgrounds/active-view-transition'),
          ],
          'https://k8o.me/playgrounds',
        ),
      ).toBe(0);
    });

    it('ブログの一覧では、見出しの今のページへのリンクと新しいタブで開くフィードを飛ばして、最初のカードを選ぶ', () => {
      expect(
        indexOfLinkToFollow(
          [
            linkTo('/blog'),
            linkTo('/blog/feed', { target: '_blank' }),
            linkTo('/blog/revert-rule'),
          ],
          'https://k8o.me/blog',
        ),
      ).toBe(2);
    });
  });

  describe('異常系', () => {
    it('ほかのページへその場で移るリンクが無ければ -1 を返す', () => {
      expect(
        indexOfLinkToFollow(
          [linkTo('/blog'), linkTo('/blog/feed', { target: '_blank' })],
          'https://k8o.me/blog',
        ),
      ).toBe(-1);
    });
  });

  describe('エッジケース', () => {
    it('今のページの search か fragment だけを替えるリンクは選ばない', () => {
      expect(
        indexOfLinkToFollow(
          [
            linkTo('/blog?q=html'),
            linkTo('/blog#2026'),
            linkTo('/blog/revert-rule'),
          ],
          'https://k8o.me/blog?q=css',
        ),
      ).toBe(2);
    });

    it('download 付きのリンクは選ばない', () => {
      expect(
        indexOfLinkToFollow(
          [linkTo('/resume.pdf', { download: true }), linkTo('/about')],
          'https://k8o.me/',
        ),
      ).toBe(1);
    });

    it('target は、無いか _self のときだけ選ぶ', () => {
      expect(
        indexOfLinkToFollow(
          [
            linkTo('/blog', { target: '_top' }),
            linkTo('/talks', { target: 'preview' }),
            linkTo('/about', { target: '_self' }),
          ],
          'https://k8o.me/',
        ),
      ).toBe(2);
    });
  });
});
