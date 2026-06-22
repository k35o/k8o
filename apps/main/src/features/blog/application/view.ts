import { db } from '@repo/database';

// 累計ビュー数をインクリメントする。
// 行が存在しない場合でも insert で自己修復するため、計測漏れが起きない。
export const incrementBlogView = (id: number) =>
  db
    .insert(db._schema.blogViews)
    .values({ blogId: id, views: 1 })
    .onConflictDoUpdate({
      target: db._schema.blogViews.blogId,
      set: { views: db._utils.increment(db._schema.blogViews.views) },
    });

// 日次ビュー数をインクリメントする。(blogId, date) 単位で集約する。
export const incrementBlogViewDaily = (id: number, date: string) =>
  db
    .insert(db._schema.blogViewDailies)
    .values({ blogId: id, date, views: 1 })
    .onConflictDoUpdate({
      target: [
        db._schema.blogViewDailies.blogId,
        db._schema.blogViewDailies.date,
      ],
      set: { views: db._utils.increment(db._schema.blogViewDailies.views) },
    });
