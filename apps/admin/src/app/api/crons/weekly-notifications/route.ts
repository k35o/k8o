import { type NextRequest, NextResponse } from 'next/server';

import { sendWeeklyCommentNotifications } from '@/features/comments/application/send-weekly-notifications';

const getErrorStatus = (
  code: 'DATABASE_ERROR' | 'PUSH_NOTIFICATION_ERROR',
): number => {
  switch (code) {
    case 'DATABASE_ERROR':
    case 'PUSH_NOTIFICATION_ERROR':
      return 500;
    default:
      return 500;
  }
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await sendWeeklyCommentNotifications();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error.message },
      { status: getErrorStatus(result.error.code) },
    );
  }

  return NextResponse.json({ ok: true });
}
