import { db } from '@repo/database';
import { count, desc, eq, inArray } from '@repo/database/orm';

type InquiryRecord = {
  id: number;
  message: string | null;
  createdAt: string;
  feedbackName: string | null;
  blogSlug: string | null;
};

type FindInquiriesResult = {
  items: InquiryRecord[];
  total: number;
};

// blog_comment.commentId に unique 制約が無く 1:N の可能性があるため、
// 一覧本体と blog 紐付けを別クエリで取得して JS でマージする。
export const findInquiries = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<FindInquiriesResult> => {
  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.comments);
  const total = totalRow[0]?.value ?? 0;

  const rows = await db
    .select({
      id: db._schema.comments.id,
      message: db._schema.comments.message,
      createdAt: db._schema.comments.createdAt,
      feedbackName: db._schema.feedbacks.name,
    })
    .from(db._schema.comments)
    .leftJoin(
      db._schema.feedbacks,
      eq(db._schema.comments.feedbackId, db._schema.feedbacks.id),
    )
    // created_at が同値でもページ境界で行が重複・欠落しないよう一意な id を tiebreaker に足す
    .orderBy(desc(db._schema.comments.createdAt), desc(db._schema.comments.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  if (rows.length === 0) {
    return { items: [], total };
  }

  const blogLinks = await db
    .select({
      commentId: db._schema.blogComment.commentId,
      blogSlug: db._schema.blogs.slug,
    })
    .from(db._schema.blogComment)
    .innerJoin(
      db._schema.blogs,
      eq(db._schema.blogs.id, db._schema.blogComment.blogId),
    )
    .where(
      inArray(
        db._schema.blogComment.commentId,
        rows.map((row) => row.id),
      ),
    );

  const slugByCommentId = new Map<number, string>();
  for (const link of blogLinks) {
    if (!slugByCommentId.has(link.commentId)) {
      slugByCommentId.set(link.commentId, link.blogSlug);
    }
  }

  return {
    items: rows.map((row) => ({
      id: row.id,
      message: row.message,
      createdAt: row.createdAt,
      feedbackName: row.feedbackName,
      blogSlug: slugByCommentId.get(row.id) ?? null,
    })),
    total,
  };
};

export const insertInquiry = async (message: string): Promise<void> => {
  await db.insert(db._schema.comments).values({ message });
};
