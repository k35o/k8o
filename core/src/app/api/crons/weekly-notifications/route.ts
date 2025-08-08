import { inArray } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getBlogContent } from '#api/blog';
import { db } from '#database/db';
import { comments } from '@/database/schema/comments';
import WeeklyNotification, {
  type Notification,
} from '@/emails/weekly-notification';
import { resend } from '@/services/email';

export async function GET(req: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const unsentComments = await db.query.comments.findMany({
    where: (comments, { isNull }) => isNull(comments.sentAt),
    with: {
      // TODO: このアクセスをnullableにする
      blogComment: {
        with: {
          blog: true,
        },
      },
      feedback: true,
    },
  });

  const notifications = await Promise.all(
    unsentComments.map(async (comment) => {
      const blog = comment.blogComment
        ? await getBlogContent(comment.blogComment.blog.slug)
        : null;

      return {
        id: comment.id,
        type: 'comment',
        message: comment.message,
        blog:
          comment.blogComment && blog
            ? {
                title: blog.title,
                link: `https://www.k8o.me/blog/${comment.blogComment.blog.slug}`,
              }
            : null,
        feedback: comment.feedback
          ? {
              id: comment.feedback.id,
              name: comment.feedback.name,
            }
          : null,
        createdAt: comment.createdAt,
      } satisfies Notification;
    }),
  );

  if (notifications.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await resend().emails.send({
    from: 'notifications@k8o.me',
    to: 'kosakanoki@gmail.com',
    subject: 'ユーザーからのお知らせ',
    react: WeeklyNotification({ notifications }),
  });

  if (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  await db
    .update(comments)
    .set({ sentAt: new Date() })
    .where(
      inArray(
        comments.id,
        notifications.map((n) => n.id),
      ),
    )
    .execute();

  return NextResponse.json({ ok: true });
}
