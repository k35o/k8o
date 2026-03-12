import { db } from '@repo/database';
import { compareDate } from '@repo/helpers/date/compare';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { sendPushNotification } from '@/services/push-notification/push-notification';

const parser = new Parser();

export async function GET(req: NextRequest) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const sources = await db.query.articleSources.findMany({
    where: eq(db._schema.articleSources.type, 'feed'),
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  let totalNew = 0;
  const failedSources: string[] = [];

  for (const source of sources) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: ソースごとに順次取得が必要
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const publishedAt = item.isoDate ?? item.pubDate;
        if (!(item.link && item.title && publishedAt)) {
          continue;
        }

        if (compareDate(new Date(publishedAt), oneWeekAgo) === 'less') {
          continue;
        }

        // biome-ignore lint/performance/noAwaitInLoops: 重複チェックのため順次実行が必要
        const existing = await db.query.articles.findFirst({
          where: eq(db._schema.articles.url, item.link),
        });

        if (existing) {
          continue;
        }

        await db.insert(db._schema.articles).values({
          articleSourceId: source.id,
          title: item.title,
          url: item.link,
          publishedAt,
        });

        totalNew++;
      }
    } catch (error) {
      failedSources.push(source.title);
      console.error(`フィード取得失敗: ${source.title} (${source.url})`, error);
    }
  }

  if (totalNew > 0) {
    revalidatePath('/reading-list');
  }

  const readingListUrl = 'https://www.k8o.me/reading-list';
  try {
    if (failedSources.length > 0) {
      await sendPushNotification(
        'フィード取得失敗',
        `${failedSources.join(', ')} の取得に失敗しました`,
        readingListUrl,
      );
    } else {
      await sendPushNotification(
        'フィード取得完了',
        `${totalNew}件の新しい記事を追加しました`,
        readingListUrl,
      );
    }
  } catch (error) {
    console.error('プッシュ通知の送信に失敗しました:', error);
  }

  return NextResponse.json({
    ok: failedSources.length === 0,
    newArticles: totalNew,
    failedSources,
  });
}
