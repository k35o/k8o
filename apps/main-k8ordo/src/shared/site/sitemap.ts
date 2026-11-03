import { playgroundSections } from '@playgrounds/sections';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getSlideContents } from '@/features/slides/interface/queries';
import { getTags } from '@/features/tags/interface/queries';
import { siteEntries } from '@/shared/site/site-entries';

const SITE_URL = 'https://k8o.me';

type SitemapUrl = {
  loc: string;
  lastmod?: string | undefined;
  changefreq?: 'weekly';
};

const toIsoString = (date: string): string => new Date(date).toISOString();

const latestOf = (dates: readonly string[]): string | undefined =>
  dates.length === 0
    ? undefined
    : new Date(
        Math.max(...dates.map((date) => new Date(date).getTime())),
      ).toISOString();

// Next の resolveSitemap と同じバイトにするため、loc をエスケープしない（slug は [a-z0-9-]+、タグの id は数字）
const toXml = (urls: readonly SitemapUrl[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ loc, lastmod, changefreq }) =>
        `<url>\n<loc>${loc}</loc>\n${
          lastmod === undefined ? '' : `<lastmod>${lastmod}</lastmod>\n`
        }${
          changefreq === undefined
            ? ''
            : `<changefreq>${changefreq}</changefreq>\n`
        }</url>\n`,
    )
    .join('')}</urlset>\n`;

export async function generateSitemap(): Promise<string> {
  const [blogs, slides, tags] = await Promise.all([
    getBlogContents(),
    getSlideContents(),
    getTags(),
  ]);

  const blogDates = blogs.map((blog) => blog.updatedAt);
  const slideDates = slides.map((slide) => slide.updatedAt);

  return toXml([
    { loc: SITE_URL, lastmod: latestOf([...blogDates, ...slideDates]) },
    { loc: `${SITE_URL}/about` },
    { loc: `${SITE_URL}/contact` },
    { loc: `${SITE_URL}/privacy` },
    {
      loc: `${SITE_URL}/blog`,
      lastmod: latestOf(blogDates),
      changefreq: 'weekly',
    },
    ...blogs.map((blog) => ({
      loc: `${SITE_URL}/blog/${blog.slug}`,
      lastmod: toIsoString(blog.updatedAt),
    })),
    {
      loc: `${SITE_URL}/slides`,
      lastmod: latestOf(slideDates),
      changefreq: 'weekly',
    },
    ...slides.map((slide) => ({
      loc: `${SITE_URL}/slides/${slide.slug}`,
      lastmod: toIsoString(slide.updatedAt),
    })),
    { loc: `${SITE_URL}/tags` },
    ...tags.map((tag) => ({ loc: `${SITE_URL}/tags/${tag.id.toString()}` })),
    ...playgroundSections.map((section) => ({
      loc: `${SITE_URL}/playgrounds/${section.id}`,
    })),
    ...siteEntries
      .filter(
        (entry) => !entry.link.startsWith('https://') && entry.link !== '/blog',
      )
      .map((entry) => ({ loc: `${SITE_URL}${entry.link}` })),
  ]);
}
