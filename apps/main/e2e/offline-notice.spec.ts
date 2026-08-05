import { expect, test } from '@playwright/test';

// Next.js はオフライン時のリトライ挙動の検証に本番ビルドを推奨しているが、
// バナー表示は offline イベント起点のため dev サーバーでも安定して検証できる。
// role=alert は Next.js の route announcer も持つため、バナー本文で特定する
const OFFLINE_MESSAGE =
  'オフラインです。接続が回復すると自動的に再試行します。';

test.describe('オフライン通知', () => {
  test('オフライン中の遷移でバナーが表示され、復帰すると消える', async ({
    context,
    page,
  }) => {
    await page.goto('/playgrounds');
    await expect(page.getByText(OFFLINE_MESSAGE)).toHaveCount(0);

    await context.setOffline(true);
    // headless環境ではofflineイベントだけでフックが反応しないことがあるため、
    // 遷移を試みてフェッチ失敗を確実に発生させる
    await page.click("a[href='/playgrounds/view-transitions']");
    await expect(page.getByText(OFFLINE_MESSAGE)).toBeVisible();

    await context.setOffline(false);
    // 復帰検知はバックグラウンドの接続チェック次第なので長めに待つ
    await expect(page.getByText(OFFLINE_MESSAGE)).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});
