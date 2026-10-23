import { describe, expect, it } from 'vitest';

import { collectLinkCardHrefs } from './link-card-urls';

describe('collectLinkCardHrefs', () => {
  describe('正常系', () => {
    it('LinkCard の href を返す', () => {
      const source = '<LinkCard href="https://example.com/page" />\n';

      expect(collectLinkCardHrefs(source)).toStrictEqual([
        'https://example.com/page',
      ]);
    });

    it('複数の LinkCard の href を記事の順に返す', () => {
      const source = [
        '<LinkCard href="https://example.com/b" />',
        '',
        '本文です。',
        '',
        '<LinkCard href="https://example.com/a" variant="outline" />',
      ].join('\n');

      expect(collectLinkCardHrefs(source)).toStrictEqual([
        'https://example.com/b',
        'https://example.com/a',
      ]);
    });

    it('要素の中や段落の中の LinkCard も拾う', () => {
      const source = [
        '<figure>',
        '  <LinkCard href="https://example.com/in-figure" />',
        '</figure>',
        '',
        '段落の中の <LinkCard href="https://example.com/in-paragraph" /> です。',
      ].join('\n');

      expect(collectLinkCardHrefs(source)).toStrictEqual([
        'https://example.com/in-figure',
        'https://example.com/in-paragraph',
      ]);
    });

    it('数式の {} を含む記事でも読める', () => {
      const source = [
        '$\\mathbb{N}$ の話です。',
        '',
        '<LinkCard href="https://example.com/math" />',
      ].join('\n');

      expect(collectLinkCardHrefs(source)).toStrictEqual([
        'https://example.com/math',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('コードの中の LinkCard は拾わない', () => {
      const source = [
        '`<LinkCard href="https://example.com/inline" />` と書きます。',
        '',
        '```mdx',
        '<LinkCard href="https://example.com/block" />',
        '```',
      ].join('\n');

      expect(collectLinkCardHrefs(source)).toStrictEqual([]);
    });

    it('LinkCard 以外の要素の href は拾わない', () => {
      const source = [
        '<a href="https://example.com/anchor">リンク</a>',
        '',
        '[markdown のリンク](https://example.com/markdown)',
      ].join('\n');

      expect(collectLinkCardHrefs(source)).toStrictEqual([]);
    });
  });
});
