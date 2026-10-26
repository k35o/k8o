const SITE_URL = 'https://k8o.me';

const PERSON = {
  '@type': 'Person',
  name: 'k8o',
  url: SITE_URL,
  jobTitle: 'Webフロントエンドエンジニア',
} as const;

type JsonLdValue =
  | string
  | number
  | boolean
  | undefined
  | JsonLdObject
  | readonly JsonLdValue[];

export type JsonLdObject = {
  readonly [key: string]: JsonLdValue;
};

export function serializeJsonLd(data: JsonLdObject): string {
  // script要素内に埋め込むため、HTMLとして解釈されうる < をエスケープする
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

export function websiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'k8o',
    url: SITE_URL,
    description: 'k8oの活動や制作物をまとめた個人サイト',
    inLanguage: 'ja',
    publisher: PERSON,
  };
}

export function personJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    ...PERSON,
    description:
      'WebフロントエンドとTypeScriptが好きなソフトウェアエンジニア。デザインシステム@k8ordo/uiを開発している。',
    sameAs: [
      'https://x.com/k8ome',
      'https://github.com/k35o',
      'https://qiita.com/k8o',
    ],
  };
}
