import { db } from '@repo/database';
import { count, desc, eq, max, sum } from '@repo/database/orm';
import type {
  BrowserSupportSyncResult,
  BrowserSupportSyncTrigger,
} from '@repo/database/schema';

type Overview = {
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
  browserSupport: {
    activeVersion: string | null;
    activeIngestedAt: string | null;
    lastRun: {
      result: BrowserSupportSyncResult;
      trigger: BrowserSupportSyncTrigger;
      createdAt: string;
    } | null;
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
    activeDataset,
    lastRun,
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
    // data 列は数 MB のブロブなので、版と取り込み時刻だけを読む
    db
      .select({
        version: db._schema.browserSupportDatasets.upstreamVersion,
        ingestedAt: db._schema.browserSupportDatasets.ingestedAt,
      })
      .from(db._schema.browserSupportDatasets)
      .where(eq(db._schema.browserSupportDatasets.state, 'active'))
      .orderBy(desc(db._schema.browserSupportDatasets.id))
      .limit(1),
    db
      .select({
        result: db._schema.browserSupportSyncRuns.result,
        trigger: db._schema.browserSupportSyncRuns.trigger,
        createdAt: db._schema.browserSupportSyncRuns.createdAt,
      })
      .from(db._schema.browserSupportSyncRuns)
      .orderBy(desc(db._schema.browserSupportSyncRuns.id))
      .limit(1),
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
    browserSupport: {
      activeVersion: activeDataset[0]?.version ?? null,
      activeIngestedAt: activeDataset[0]?.ingestedAt ?? null,
      lastRun: lastRun[0] ?? null,
    },
  };
};
