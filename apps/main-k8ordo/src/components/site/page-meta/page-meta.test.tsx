import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PageMeta } from './page-meta';

type Tag = { name: string; attrs: Record<string, string>; text: string };

const tagsOf = (props: ComponentProps<typeof PageMeta>): Tag[] =>
  [
    ...renderToStaticMarkup(<PageMeta {...props} />).matchAll(
      /<(title|meta|link)([^>]*?)\/?>(?:([^<]*)<\/title>)?/gu,
    ),
  ].map(([, name = '', attrs = '', text = '']) => ({
    name,
    attrs: Object.fromEntries(
      [...attrs.matchAll(/([\w:-]+)="([^"]*)"/gu)].map(
        ([, key = '', value = '']) => [key, value],
      ),
    ),
    text,
  }));

const titleOf = (tags: Tag[]): string | undefined =>
  tags.find((tag) => tag.name === 'title')?.text;

const metaOf = (
  tags: Tag[],
  key: 'name' | 'property',
  value: string,
): string | undefined =>
  tags.find((tag) => tag.name === 'meta' && tag.attrs[key] === value)?.attrs[
    'content'
  ];

const linkOf = (tags: Tag[], rel: string): Record<string, string> | undefined =>
  tags.find((tag) => tag.name === 'link' && tag.attrs['rel'] === rel)?.attrs;

describe('PageMeta', () => {
  describe('正常系', () => {
    it('題を渡すと、title にサイト名を付け、og と twitter には題だけを書く', () => {
      const tags = tagsOf({ title: 'About', path: '/about' });

      expect(titleOf(tags)).toBe('About | k8o');
      expect(metaOf(tags, 'property', 'og:title')).toBe('About');
      expect(metaOf(tags, 'name', 'twitter:title')).toBe('About');
    });

    it('題を省くと、どれもサイト名にする', () => {
      const tags = tagsOf({ path: '/' });

      expect(titleOf(tags)).toBe('k8o');
      expect(metaOf(tags, 'property', 'og:title')).toBe('k8o');
      expect(metaOf(tags, 'name', 'twitter:title')).toBe('k8o');
    });

    it('説明を description・og・twitter に書き、省くとサイトの説明にする', () => {
      const given = tagsOf({
        path: '/about',
        description: 'k8oのプロフィールです。',
      });
      const omitted = tagsOf({ path: '/' });

      for (const [tags, description] of [
        [given, 'k8oのプロフィールです。'],
        [omitted, 'k8oの活動や制作物をまとめた個人サイト'],
      ] as const) {
        expect(metaOf(tags, 'name', 'description')).toBe(description);
        expect(metaOf(tags, 'property', 'og:description')).toBe(description);
        expect(metaOf(tags, 'name', 'twitter:description')).toBe(description);
      }
    });

    it('og のサイトの項目と twitter のカードを書く', () => {
      const tags = tagsOf({ path: '/about' });

      expect(metaOf(tags, 'property', 'og:url')).toBe('https://k8o.me/about');
      expect(metaOf(tags, 'property', 'og:site_name')).toBe('k8o');
      expect(metaOf(tags, 'property', 'og:locale')).toBe('ja');
      expect(metaOf(tags, 'property', 'og:type')).toBe('website');
      expect(metaOf(tags, 'name', 'twitter:card')).toBe('summary');
    });

    it('canonical を求めると、パスの絶対 URL で書く', () => {
      const tags = tagsOf({ path: '/about', canonical: true });

      expect(linkOf(tags, 'canonical')).toStrictEqual({
        rel: 'canonical',
        href: 'https://k8o.me/about',
      });
    });

    it('OG の画像を、og と twitter に 1200×630 の PNG として書く', () => {
      const tags = tagsOf({
        path: '/',
        image: { path: '/og.png', alt: 'k8o' },
      });

      for (const prefix of ['og:image', 'twitter:image']) {
        const key = prefix === 'og:image' ? 'property' : 'name';
        expect(metaOf(tags, key, prefix)).toBe('https://k8o.me/og.png');
        expect(metaOf(tags, key, `${prefix}:type`)).toBe('image/png');
        expect(metaOf(tags, key, `${prefix}:width`)).toBe('1200');
        expect(metaOf(tags, key, `${prefix}:height`)).toBe('630');
        expect(metaOf(tags, key, `${prefix}:alt`)).toBe('k8o');
      }
    });

    it('フィードのパスを、RSS の alternate として絶対 URL で書く', () => {
      const tags = tagsOf({ path: '/blog', rssFeedPath: '/blog/feed' });

      expect(linkOf(tags, 'alternate')).toStrictEqual({
        rel: 'alternate',
        type: 'application/rss+xml',
        href: 'https://k8o.me/blog/feed',
      });
    });

    it('titleTemplate を外すと、title にもサイト名を付けずに題だけを書く', () => {
      const tags = tagsOf({
        title: 'CSSのabs()とsign()',
        titleTemplate: false,
        path: '/blog/abs-sign',
      });

      expect(titleOf(tags)).toBe('CSSのabs()とsign()');
      expect(metaOf(tags, 'property', 'og:title')).toBe('CSSのabs()とsign()');
    });

    it('twitter のカードの型を変えられる', () => {
      const tags = tagsOf({
        path: '/blog/abs-sign',
        twitterCard: 'summary_large_image',
      });

      expect(metaOf(tags, 'name', 'twitter:card')).toBe('summary_large_image');
    });

    it('記事の日付を渡すと、og の型を article にし、公開日・更新日・著者を書く', () => {
      const tags = tagsOf({
        path: '/blog/abs-sign',
        article: { publishedTime: '2025-06-26', modifiedTime: '2025-07-01' },
      });

      expect(metaOf(tags, 'property', 'og:type')).toBe('article');
      expect(metaOf(tags, 'property', 'article:published_time')).toBe(
        '2025-06-26',
      );
      expect(metaOf(tags, 'property', 'article:modified_time')).toBe(
        '2025-07-01',
      );
      expect(metaOf(tags, 'property', 'article:author')).toBe('k8o');
    });

    it('記事の更新日を省くと、article:modified_time を書かない', () => {
      const tags = tagsOf({
        path: '/slides/sample-deck',
        article: { publishedTime: '2026-05-15' },
      });

      expect(metaOf(tags, 'property', 'og:type')).toBe('article');
      expect(metaOf(tags, 'property', 'article:published_time')).toBe(
        '2026-05-15',
      );
      expect(metaOf(tags, 'property', 'article:modified_time')).toBeUndefined();
      expect(metaOf(tags, 'property', 'article:author')).toBe('k8o');
    });

    it('分類を category に書く', () => {
      const tags = tagsOf({ path: '/blog/abs-sign', category: 'CSS, abs' });

      expect(metaOf(tags, 'name', 'category')).toBe('CSS, abs');
    });

    it('noindex を求めると、robots に書く', () => {
      const tags = tagsOf({ path: '/', noindex: true });

      expect(metaOf(tags, 'name', 'robots')).toBe('noindex');
    });
  });

  describe('エッジケース', () => {
    it('説明に null を渡すと、description・og・twitter の説明をどれも書かない', () => {
      const tags = tagsOf({ path: '/blog/abs-sign', description: null });

      const attrs = tags.map((tag) => tag.attrs);
      for (const key of [
        { name: 'description' },
        { property: 'og:description' },
        { name: 'twitter:description' },
      ]) {
        expect(attrs).not.toContainEqual(expect.objectContaining(key));
      }
    });

    it('トップの URL は末尾の / を付けずに書く', () => {
      const tags = tagsOf({ path: '/', canonical: true });

      expect(metaOf(tags, 'property', 'og:url')).toBe('https://k8o.me');
      expect(linkOf(tags, 'canonical')?.['href']).toBe('https://k8o.me');
    });

    it('求めなければ、canonical・画像・alternate・robots を書かない', () => {
      const tags = tagsOf({ path: '/about' });

      expect(linkOf(tags, 'canonical')).toBeUndefined();
      expect(linkOf(tags, 'alternate')).toBeUndefined();
      expect(metaOf(tags, 'property', 'og:image')).toBeUndefined();
      expect(metaOf(tags, 'name', 'twitter:image')).toBeUndefined();
      expect(metaOf(tags, 'name', 'robots')).toBeUndefined();
      expect(metaOf(tags, 'name', 'category')).toBeUndefined();
      expect(metaOf(tags, 'property', 'article:author')).toBeUndefined();
    });
  });
});
