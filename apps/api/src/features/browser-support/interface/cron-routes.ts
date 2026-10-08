import { Hono } from 'hono';

import type { BrowserSupportSyncTrigger } from '../infrastructure/browser-support-repository';
import { runBrowserSupportSync } from './sync';

// Vercel Cron にリトライは無いが、失敗をログ・cron 画面で失敗として見せるため 500 で返す。
const FAILURE_RESULTS = new Set([
  'fetch_failed',
  'validation_failed',
  'db_failed',
]);

// Vercel Cron はクエリ無しで呼ぶ。外形監視(GitHub Actions)の自走復旧は monitor、
// 人が workflow_dispatch で起動した再同期は manual として記録を分ける。
const parseTrigger = (value: string | undefined): BrowserSupportSyncTrigger =>
  value === 'monitor' || value === 'manual' ? value : 'cron';

export const browserSupportCronRoutes = new Hono().get('/', async (c) => {
  const trigger = parseTrigger(c.req.query('trigger'));
  const force = c.req.query('force') === 'true';

  try {
    const summary = await runBrowserSupportSync(trigger, { force });
    const failed = FAILURE_RESULTS.has(summary.result);
    return c.json({ ok: !failed, ...summary }, failed ? 500 : 200);
  } catch (error) {
    console.error('ブラウザ対応状況の同期に失敗しました:', error);
    return c.json({ ok: false, error: 'sync failed' }, 500);
  }
});
