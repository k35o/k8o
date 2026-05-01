import { db } from '@repo/database';
import { and, eq, inArray, isNull } from 'drizzle-orm';

export type ClaimedComment = {
  id: number;
};

export const claimUnsentComments = async (
  claimedAt: string,
): Promise<ClaimedComment[]> => {
  const comments = await db.transaction((tx) =>
    tx
      .update(db._schema.comments)
      .set({ sentAt: claimedAt })
      .where(isNull(db._schema.comments.sentAt))
      .returning({ id: db._schema.comments.id }),
  );
  return comments;
};

export const releaseClaimedComments = async (
  comments: ClaimedComment[],
  claimedAt: string,
): Promise<void> => {
  await db
    .update(db._schema.comments)
    .set({ sentAt: null })
    .where(
      and(
        inArray(
          db._schema.comments.id,
          comments.map((comment) => comment.id),
        ),
        eq(db._schema.comments.sentAt, claimedAt),
      ),
    )
    .execute();
};
