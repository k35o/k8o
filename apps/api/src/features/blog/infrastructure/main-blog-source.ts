import Parser from 'rss-parser';

// 記事の本文とタイトルは main の MDX にあり DB には無いので、main の公開ページから読む
const MAIN_BLOG_URL = 'https://k8o.me/blog';
const FETCH_TIMEOUT_MS = 10_000;
export const BLOG_SLUG_PATTERN = /^[a-z0-9-]+$/u;

const parser = new Parser();

export type BlogEntry = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string | null;
  url: string;
};

const slugFromLink = (link: string | undefined): string | null => {
  if (link === undefined || !link.startsWith(`${MAIN_BLOG_URL}/`)) {
    return null;
  }
  const slug = link.slice(MAIN_BLOG_URL.length + 1);
  return BLOG_SLUG_PATTERN.test(slug) ? slug : null;
};

export async function fetchPublishedBlogs(): Promise<BlogEntry[]> {
  const response = await fetch(`${MAIN_BLOG_URL}/feed`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`main のブログのフィードを取れません: ${response.status}`);
  }
  const feed = await parser.parseString(await response.text());
  return feed.items.flatMap((item): BlogEntry[] => {
    const slug = slugFromLink(item.link);
    if (slug === null || item.title === undefined) {
      return [];
    }
    return [
      {
        slug,
        title: item.title,
        // contentSnippet は HTML とみなしてタグを消すので、説明の中の `<dialog>` などが抜ける
        description: item.content ?? '',
        tags: item.categories ?? [],
        publishedAt: item.isoDate ?? null,
        url: `${MAIN_BLOG_URL}/${slug}`,
      },
    ];
  });
}

export async function fetchBlogMarkdown(slug: string): Promise<string | null> {
  const response = await fetch(`${MAIN_BLOG_URL}/${slug}.md`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`main の記事の markdown を取れません: ${response.status}`);
  }
  return response.text();
}
