import { NextResponse } from 'next/server';

import { getBrowserSupportHealth } from '@/features/browser-support/interface/health';

// browser-support データ同期の外形監視エンドポイント。読み取り専用・秘匿情報なしの
// ため無認証で公開する。`curl -f` で判定できるよう、ok 以外は 503 を返す。
export async function GET(): Promise<NextResponse> {
  const report = await getBrowserSupportHealth();
  return NextResponse.json(report, {
    status: report.status === 'ok' ? 200 : 503,
  });
}
