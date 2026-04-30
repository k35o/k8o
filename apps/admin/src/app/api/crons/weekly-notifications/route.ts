import { type NextRequest, NextResponse } from 'next/server';
import { sendWeeklyCommentNotifications } from '@/features/comments/application/send-weekly-notifications';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await sendWeeklyCommentNotifications();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true });
}
