import { db } from '#database/db';
import { getBlogMetadata } from '#services/blog';
import WeeklyNotification, {
  Notification,
} from '@/emails/weekly-notification';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const blog = comment.blogComment
        ? await getBlogMetadata(comment.blogComment.blog.slug)
        : null;

      return {
        id: comment.id,
        type: 'comment',
        message: comment.message,
        blog:
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  await resend.emails.send({
    from: 'notifications@k8o.me',
    to: 'kosakanoki@gmail.com',
    subject: 'ユーザーからのお知らせ',
    react: WeeklyNotification({ notifications }),
  });

  return NextResponse.json({ ok: true });
}
