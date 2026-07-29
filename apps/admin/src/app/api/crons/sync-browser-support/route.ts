import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { runBrowserSupportSync } from '@/features/browser-support/interface/sync';
import { isAuthorizedCronRequest } from '@/shared/auth/verify-cron-request';

// 4.7MB のダウンロード + 変換 + 検証 + DB 置換。通常は数秒だが、既定値に依存しない。
export const maxDuration = 60;

// Vercel Cron にリトライは無いが、失敗をログ・cron 画面で失敗として見せるため 500 で返す。
const FAILURE_RESULTS = new Set([
  'fetch_failed',
  'validation_failed',
  'db_failed',
]);

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 外形監視(GitHub Actions)からの自走復旧は trigger=monitor で区別して記録する
  const trigger =
    req.nextUrl.searchParams.get('trigger') === 'monitor' ? 'monitor' : 'cron';

  try {
    const summary = await runBrowserSupportSync(trigger);
    const failed = FAILURE_RESULTS.has(summary.result);
    return NextResponse.json(
      { ok: !failed, ...summary },
      { status: failed ? 500 : 200 },
    );
  } catch (error) {
    console.error('ブラウザ対応状況の同期に失敗しました:', error);
    return NextResponse.json(
      { ok: false, error: 'sync failed' },
      { status: 500 },
    );
  }
}
