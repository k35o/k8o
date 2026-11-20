import { formatDate } from '@repo/helpers/date/format';

import type { ReleaseGroup } from './releases';

export type ActivityItem =
  | { kind: 'blog'; id: string; date: string; title: string; href: string }
  | {
      kind: 'talk';
      id: string;
      date: string;
      title: string;
      eventName: string;
      href: string;
      // 登壇の日がまだ来ていない
      upcoming: boolean;
    }
  | {
      kind: 'release';
      id: string;
      date: string;
      packageName: string;
      version: string;
      href: string;
    };

type FeedSources = {
  blogs: Array<{ slug: string; title: string; createdAt: string }>;
  talks: Array<{
    id: number;
    title: string;
    eventName: string;
    eventUrl: string;
    // yyyy-MM-dd
    eventDate: string;
    slidesHref: string | null;
  }>;
  releases: ReleaseGroup[];
  now: Date;
};

// 記事・登壇・リリースを新しい順に混ぜる
export const buildActivityFeed = ({
  blogs,
  talks,
  releases,
  now,
}: FeedSources): ActivityItem[] => {
  const today = formatDate(now, 'yyyy-MM-dd');
  const items: ActivityItem[] = [
    ...blogs.map((blog) => ({
      kind: 'blog' as const,
      id: `blog:${blog.slug}`,
      date: blog.createdAt,
      title: blog.title,
      href: `/blog/${blog.slug}`,
    })),
    ...talks.map((talk) => ({
      kind: 'talk' as const,
      id: `talk:${talk.id}`,
      date: talk.eventDate,
      title: talk.title,
      eventName: talk.eventName,
      href: talk.slidesHref ?? talk.eventUrl,
      upcoming: talk.eventDate > today,
    })),
    ...releases.map((release) => ({
      kind: 'release' as const,
      id: `release:${release.packageName}:${release.version}`,
      date: release.publishedAt,
      packageName: release.packageName,
      version: release.version,
      href: release.href,
    })),
  ];
  return items.toSorted((a, b) => Date.parse(b.date) - Date.parse(a.date));
};
