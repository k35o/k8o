import { StatCard } from '@/app/(authenticated)/_components/stat-card/stat-card';
import { getComments } from '@/features/comments/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { CommentList } from './_components/comment-list';

export default async function CommentsPage() {
  await verifySession();

  const items = await getComments();
  const total = items.length;
  const unsent = items.filter((item) => item.sentAt === null).length;
  const sent = total - unsent;
  const blogLinked = items.filter((item) => item.blogSlug !== null).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold">お問い合わせ</h2>
        <p className="text-fg-mute mt-2 text-sm">
          ブログ記事のフィードバックフォーム経由で届いたお問い合わせとコメントを確認します。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="総件数" value={String(total)} />
        <StatCard
          description={`通知済み: ${sent}件`}
          label="未通知"
          value={String(unsent)}
        />
        <StatCard label="ブログ紐付け" value={String(blogLinked)} />
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-bold">一覧</h3>
        <CommentList items={items} />
      </section>
    </div>
  );
}
