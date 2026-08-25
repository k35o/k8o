import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { runArticleSync } from '@/features/reading-list/interface/sync';
import { isAuthorizedCronRequest } from '@/shared/auth/verify-cron-request';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { newArticles, updatedArticles, enrichedArticles, failedSources } =
    await runArticleSync({ notify: true });

  return NextResponse.json({
    ok: failedSources.length === 0,
    newArticles,
    updatedArticles,
    enrichedArticles,
    failedSources,
  });
}
