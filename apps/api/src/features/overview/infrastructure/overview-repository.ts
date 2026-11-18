import { db } from '@repo/database';
import { count, desc, max, sum } from '@repo/database/orm';

export type Overview = {
  blogs: { published: number; drafts: number; totalViews: number };
  inquiries: { total: number; latestAt: string | null };
  push: {
    subscribers: number;
    lastSentAt: string | null;
    lastSucceeded: number | null;
    lastFailed: number | null;
  };
  readingList: {
    articles: number;
    sources: number;
    latestPublishedAt: string | null;
  };
};

export const findOverview = async (): Promise<Overview> => {
  const [
    blogCounts,
    viewRow,
    inquiryRow,
    subscriberRow,
    lastPush,
    articleRow,
    sourceRow,
  ] = await Promise.all([
    db
      .select({ published: db._schema.blogs.published, value: count() })
      .from(db._schema.blogs)
      .groupBy(db._schema.blogs.published),
    db
      .select({ value: sum(db._schema.blogViews.views) })
      .from(db._schema.blogViews),
    db
      .select({ value: count(), latestAt: max(db._schema.comments.createdAt) })
      .from(db._schema.comments),
    db.select({ value: count() }).from(db._schema.pushSubscriptions),
    db
      .select({
        sentAt: db._schema.pushLogs.sentAt,
        succeeded: db._schema.pushLogs.succeeded,
        failed: db._schema.pushLogs.failed,
      })
      .from(db._schema.pushLogs)
      .orderBy(desc(db._schema.pushLogs.sentAt))
      .limit(1),
    db
      .select({
        value: count(),
        latestPublishedAt: max(db._schema.articles.publishedAt),
      })
      .from(db._schema.articles),
    db.select({ value: count() }).from(db._schema.articleSources),
  ]);

  return {
    blogs: {
      published: blogCounts.find((row) => row.published)?.value ?? 0,
      drafts: blogCounts.find((row) => !row.published)?.value ?? 0,
      totalViews: Number(viewRow[0]?.value ?? 0),
    },
    inquiries: {
      total: inquiryRow[0]?.value ?? 0,
      latestAt: inquiryRow[0]?.latestAt ?? null,
    },
    push: {
      subscribers: subscriberRow[0]?.value ?? 0,
      lastSentAt: lastPush[0]?.sentAt ?? null,
      lastSucceeded: lastPush[0]?.succeeded ?? null,
      lastFailed: lastPush[0]?.failed ?? null,
    },
    readingList: {
      articles: articleRow[0]?.value ?? 0,
      sources: sourceRow[0]?.value ?? 0,
      latestPublishedAt: articleRow[0]?.latestPublishedAt ?? null,
    },
  };
};
