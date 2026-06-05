import { BlogIcon, LinkIcon, MailIcon } from '@k8o/arte-odyssey';

import {
  ListPagination,
  SearchField,
  SectionHeader,
  StatCard,
} from '@/app/(authenticated)/_components';
import {
  getComments,
  getCommentStats,
} from '@/features/comments/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';
import {
  firstParam,
  getTotalPages,
  parsePageParam,
} from '@/shared/search-params';

import { CommentList } from '../comment-list';

const PAGE_SIZE = 20;

export const CommentsContent = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await verifySession();

  const sp = await searchParams;
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  const [stats, { items, total }] = await Promise.all([
    getCommentStats(),
    getComments({ q, page, pageSize: PAGE_SIZE }),
  ]);

  const totalPages = getTotalPages(total, PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          icon={<MailIcon size="md" />}
          label="総件数"
          value={String(stats.total)}
        />
        <StatCard
          icon={<BlogIcon size="md" />}
          label="ブログ紐付け"
          value={String(stats.blogLinked)}
        />
        <StatCard
          icon={<LinkIcon size="md" />}
          label="未紐づけ"
          value={String(stats.unlinked)}
        />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader title="一覧" />
        <SearchField placeholder="本文で検索" />
        <CommentList items={items} />
        <div className="flex justify-center">
          <ListPagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </>
  );
};
