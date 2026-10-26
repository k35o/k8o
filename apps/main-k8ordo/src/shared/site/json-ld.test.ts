import { describe, expect, it } from 'vitest';

import { personJsonLd, serializeJsonLd, websiteJsonLd } from './json-ld';

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
        url: 'https://k8o.me',
        jobTitle: 'Webフロントエンドエンジニア',
        description:
          'WebフロントエンドとTypeScriptが好きなソフトウェアエンジニア。デザインシステム@k8ordo/uiを開発している。',
        sameAs: [
          'https://x.com/k8ome',
          'https://github.com/k35o',
          'https://qiita.com/k8o',
        ],
      });
    });
  });
});
