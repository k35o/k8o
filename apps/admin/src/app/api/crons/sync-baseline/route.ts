import { type NextRequest, NextResponse } from 'next/server';
import { syncBaseline } from '@/features/baseline/application/sync-baseline';
import { sendPushNotification } from '@/features/push-notification/infrastructure/push-notification';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const { newFeatures, statusChanges } = await syncBaseline();

    const hasChanges = newFeatures.length > 0 || statusChanges.length > 0;

    if (hasChanges) {
      const parts: string[] = [];
      const newlyCount = newFeatures.filter((f) => f.status === 'newly').length;
      const widelyCount = newFeatures.filter(
        (f) => f.status === 'widely',
      ).length;

      if (newlyCount > 0) {
        parts.push(`Newly: ${newlyCount}件`);
      }
      if (widelyCount > 0) {
        parts.push(`Widely: ${widelyCount}件`);
      }
      if (statusChanges.length > 0) {
        parts.push(`ステータス変更: ${statusChanges.length}件`);
      }

      try {
        await sendPushNotification(
          'Baseline更新',
          parts.join('、'),
          'https://k8o.me/baseline',
        );
      } catch (error) {
        console.error('プッシュ通知の送信に失敗しました:', error);
      }
    }

    return NextResponse.json({
      ok: true,
      newFeatures: newFeatures.length,
      statusChanges: statusChanges.length,
    });
  } catch (error) {
    console.error('Baseline同期に失敗しました:', error);
    return NextResponse.json(
      { ok: false, error: 'sync failed' },
      { status: 500 },
    );
  }
}
