const SITE_URL = 'https://k8o.me';

const PERSON = {
  '@type': 'Person',
  name: 'k8o',
  url: SITE_URL,
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
    sameAs: [
      'https://x.com/k8ome',
      'https://github.com/k35o',
      'https://qiita.com/k8o',
    ],
  };
}

type BlogPostingInput = {
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ReadonlyArray<{ name: string }>;
};

export function blogPostingJsonLd(blog: BlogPostingInput): JsonLdObject {
  const url = `${SITE_URL}/blog/${blog.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description ?? undefined,
    url,
    mainEntityOfPage: url,
    image: `${url}/opengraph-image`,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    inLanguage: 'ja',
    author: PERSON,
    keywords:
      blog.tags.length > 0 ? blog.tags.map((tag) => tag.name) : undefined,
  };
}

type BreadcrumbItem = {
  name: string;
  url: string;
};

function breadcrumbList(items: readonly BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogBreadcrumbJsonLd(blog: {
  slug: string;
  title: string;
}): JsonLdObject {
  return breadcrumbList([
    { name: 'ホーム', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    { name: blog.title, url: `${SITE_URL}/blog/${blog.slug}` },
  ]);
}

export function tagBreadcrumbJsonLd(tag: {
  id: number;
  name: string;
}): JsonLdObject {
  return breadcrumbList([
    { name: 'ホーム', url: SITE_URL },
    { name: 'Tags', url: `${SITE_URL}/tags` },
    { name: tag.name, url: `${SITE_URL}/tags/${tag.id.toString()}` },
  ]);
}

type TalkEventInput = {
  title: string;
  eventName: string;
  eventUrl: string;
  eventDate: string;
  eventLocation: string | null;
};

export function talkEventsJsonLd(
  talks: readonly TalkEventInput[],
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: talks.map((talk, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: talk.title,
        startDate: talk.eventDate,
        url: talk.eventUrl,
        location:
          talk.eventLocation === null
            ? undefined
            : { '@type': 'Place', name: talk.eventLocation },
        organizer: {
          '@type': 'Organization',
          name: talk.eventName,
          url: talk.eventUrl,
        },
        performer: PERSON,
      },
    })),
  };
}
