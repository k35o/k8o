import { db } from '@repo/database';
import { inArray } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getBlogContent } from '@/app/blog/_api';

type Notification = {
  id: number;
  message: string | null;
  blog: {
    title: string;
    link: string;
  } | null;
  feedback: {
    id: number;
    name: string;
  } | null;
};

export async function GET(req: NextRequest) {
  if (
    !process.env['CRON_SECRET'] ||
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
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
      } satisfies Notification;
    }),
  );

  if (notifications.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env['K8O_PUSH_API_KEY'];
  if (!apiKey) {
    console.error('K8O_PUSH_API_KEY is not configured');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // k8o-push APIに通知を送信
  const response = await fetch('https://api.push.k8o.me/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      title: `週次レポート (${notifications.length}件)`,
      body: `お問い合わせが${notifications.length}件あります`,
      url: 'https://www.k8o.me',
    }),
  });

  if (!response.ok) {
    console.error('Error sending push notification:', await response.text());
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  await db
    .update(db._schema.comments)
    .set({ sentAt: new Date().toISOString() })
    .where(
      inArray(
        db._schema.comments.id,
        notifications.map((n) => n.id),
      ),
    )
    .execute();

  return NextResponse.json({ ok: true });
}
