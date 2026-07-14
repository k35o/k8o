import {
  blogBreadcrumbJsonLd,
  blogPostingJsonLd,
  personJsonLd,
  serializeJsonLd,
  tagBreadcrumbJsonLd,
  talkEventsJsonLd,
  websiteJsonLd,
} from './json-ld';

describe('serializeJsonLd', () => {
  describe('正常系', () => {
    it('オブジェクトをJSON文字列に変換するべき', () => {
      expect(serializeJsonLd({ '@type': 'Thing', name: 'k8o' })).toBe(
        '{"@type":"Thing","name":"k8o"}',
      );
    });

    it('undefinedの値を持つキーを出力しないべき', () => {
      expect(serializeJsonLd({ name: 'k8o', description: undefined })).toBe(
        '{"name":"k8o"}',
      );
    });
  });

  describe('エッジケース', () => {
    it('script要素を閉じうる < をエスケープするべき', () => {
      const serialized = serializeJsonLd({ name: '</script><script>' });
      expect(serialized).not.toContain('<');
      expect(JSON.parse(serialized)).toStrictEqual({
        name: '</script><script>',
      });
    });
  });
});

describe('websiteJsonLd', () => {
  describe('正常系', () => {
    it('WebSiteスキーマを返すべき', () => {
      expect(websiteJsonLd()).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'k8o',
        url: 'https://k8o.me',
      });
    });
  });
});

describe('personJsonLd', () => {
  describe('正常系', () => {
    it('SNSアカウントをsameAsに含むPersonスキーマを返すべき', () => {
      expect(personJsonLd()).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'k8o',
        sameAs: [
          'https://x.com/k8ome',
          'https://github.com/k35o',
          'https://qiita.com/k8o',
        ],
      });
    });
  });
});

describe('blogPostingJsonLd', () => {
  const blog = {
    slug: 'sample-post',
    title: 'サンプル記事',
    description: '記事の説明',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-02',
    tags: [{ name: 'CSS' }, { name: 'React' }],
  };

  describe('正常系', () => {
    it('記事の情報からBlogPostingスキーマを返すべき', () => {
      expect(blogPostingJsonLd(blog)).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'サンプル記事',
        description: '記事の説明',
        url: 'https://k8o.me/blog/sample-post',
        image: 'https://k8o.me/blog/sample-post/opengraph-image',
        datePublished: '2025-01-01',
        dateModified: '2025-01-02',
        keywords: ['CSS', 'React'],
      });
    });
  });

  describe('エッジケース', () => {
    it('descriptionがnullの場合は出力に含めないべき', () => {
      const jsonLd = blogPostingJsonLd({ ...blog, description: null });
      expect(serializeJsonLd(jsonLd)).not.toContain('description');
    });

    it('タグが空の場合はkeywordsを出力に含めないべき', () => {
      const jsonLd = blogPostingJsonLd({ ...blog, tags: [] });
      expect(serializeJsonLd(jsonLd)).not.toContain('keywords');
    });
  });
});

describe('blogBreadcrumbJsonLd', () => {
  describe('正常系', () => {
    it('ホーム > Blog > 記事タイトルの階層を持つBreadcrumbListを返すべき', () => {
      expect(
        blogBreadcrumbJsonLd({ slug: 'sample-post', title: 'サンプル記事' }),
      ).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'ホーム',
            item: 'https://k8o.me',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://k8o.me/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'サンプル記事',
            item: 'https://k8o.me/blog/sample-post',
          },
        ],
      });
    });
  });
});

describe('tagBreadcrumbJsonLd', () => {
  describe('正常系', () => {
    it('ホーム > Tags > タグ名の階層を持つBreadcrumbListを返すべき', () => {
      expect(tagBreadcrumbJsonLd({ id: 42, name: 'CSS' })).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'ホーム',
            item: 'https://k8o.me',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tags',
            item: 'https://k8o.me/tags',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'CSS',
            item: 'https://k8o.me/tags/42',
          },
        ],
      });
    });
  });
});

describe('talkEventsJsonLd', () => {
  const talk = {
    title: 'サンプルトーク',
    eventName: 'サンプルカンファレンス',
    eventUrl: 'https://example.com/talks/1',
    eventDate: '2025-05-24',
    eventLocation: '東京',
  };

  describe('正常系', () => {
    it('トークの一覧からItemListスキーマを返すべき', () => {
      expect(talkEventsJsonLd([talk])).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'Event',
              name: 'サンプルトーク',
              startDate: '2025-05-24',
              location: { '@type': 'Place', name: '東京' },
            },
          },
        ],
      });
    });
  });

  describe('エッジケース', () => {
    it('開催場所がnullの場合はlocationを出力に含めないべき', () => {
      const jsonLd = talkEventsJsonLd([{ ...talk, eventLocation: null }]);
      expect(serializeJsonLd(jsonLd)).not.toContain('location');
    });
  });
});
