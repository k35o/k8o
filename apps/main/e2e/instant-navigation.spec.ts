import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

import { BASE_URL } from '../playwright.config';

// DB 接続なしで動くルート(playgrounds はローカル静的データ)に限定し、
// 環境に依存せず instant navigation の回帰を検出する
test.describe('Playgroundセクション (/playgrounds/[id])', () => {
  test('初期ロードで静的コンテンツが即時表示される', async ({ page }) => {
    await instant(
      page,
      async () => {
        await page.goto('/playgrounds/view-transitions');
        await expect(
          page.getByRole('heading', { name: 'View Transition API' }),
        ).toBeVisible();
        await expect(page.getByText('Playgrounds一覧に戻る')).toBeVisible();
      },
      { baseURL: BASE_URL },
    );
  });

  test('一覧からのクライアント遷移でApp Shellが即時表示される', async ({
    page,
  }) => {
    await page.goto('/playgrounds');
    await instant(page, async () => {
      await page.click('a[href="/playgrounds/view-transitions"]');
      await page.waitForURL(
        (url) => url.pathname === '/playgrounds/view-transitions',
      );
      await expect(page.getByText('Playgrounds一覧に戻る')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'View Transition API' }),
      ).toHaveCount(0);
    });
    await expect(
      page.getByRole('heading', { name: 'View Transition API' }),
    ).toBeVisible();
  });
});
