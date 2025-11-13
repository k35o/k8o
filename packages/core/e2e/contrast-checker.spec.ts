// spec: contrast-checker-test-plan.md
// seed: core/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('コントラストチェッカーのE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // コントラストチェッカーページに直接アクセス（baseURLからの相対パス）
    await page.goto('/contrast-checker');
  });

  test('ページの初期状態を確認', async ({ page }) => {
    // ページタイトルが「コントラストチェッカー」と表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'コントラストチェッカー' }),
    ).toBeVisible();

    // 背景色の入力フィールドが表示され、デフォルト値が#000000であることを確認
    const bgColorInput = page.locator('input[type="color"]').first();
    await expect(bgColorInput).toBeVisible();
    await expect(bgColorInput).toHaveValue('#000000');

    // 文字色の入力フィールドが表示され、デフォルト値が#ffffffであることを確認
    const fgColorInput = page.locator('input[type="color"]').nth(1);
    await expect(fgColorInput).toBeVisible();
    await expect(fgColorInput).toHaveValue('#ffffff');

    // 背景色のプレビューが#000000として表示されることを確認
    await expect(page.locator('p:has-text("#000000")').last()).toBeVisible();

    // 文字色のプレビューが#ffffffとして表示されることを確認
    await expect(page.locator('p:has-text("#ffffff")').last()).toBeVisible();
  });

  test('初期状態のコントラスト比を確認', async ({ page }) => {
    // コントラスト比が21.00:1と表示されることを確認（最大値）
    await expect(
      page.getByText('入力した色のコントラスト比は21.00:1です'),
    ).toBeVisible();

    // WCAG基準テーブルが表示されることを確認
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // テーブルのヘッダーが表示されることを確認
    await expect(
      page.getByRole('cell', { name: 'AA', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'AAA', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'テキスト', exact: true }),
    ).toBeVisible();

    // 4つのテキストサイズの行が表示されることを確認
    await expect(
      page.getByRole('cell', {
        name: '大文字の太字のテキスト（18.66px bold）',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: '大文字のテキスト（24px）' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: '小文字の太字のテキスト（16px bold）' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: '小文字のテキスト（18.66px）' }),
    ).toBeVisible();
  });

  test('初期状態の適合状態を確認', async ({ page }) => {
    // すべてのテキストサイズでAA基準とAAA基準が「OK」と表示されることを確認
    const okCells = page.getByText('OK');
    await expect(okCells).toHaveCount(8); // 4つのテキストサイズ × 2つの基準
  });

  test('AAA基準合格の確認', async ({ page }) => {
    // デフォルト値（#000000と#ffffff）でコントラスト比21.00:1
    // すべてのテキストサイズでAAA基準が「OK」となることを確認
    const okCells = page.getByText('OK');
    await expect(okCells).toHaveCount(8); // 4つのテキストサイズ × 2つの基準
  });

  test('WCAG基準の説明セクションを確認', async ({ page }) => {
    // WCAG 2.2へのリンクが表示され、クリック可能であることを確認
    const wcagLink = page.getByRole('link', { name: 'WCAG 2.2' });
    await expect(wcagLink).toBeVisible();
    await expect(wcagLink).toHaveAttribute(
      'href',
      'https://www.w3.org/TR/WCAG22/',
    );

    // 「WCAG 2.2によるコントラスト比の基準」というテキストが表示されることを確認
    await expect(page.getByText('によるコントラスト比の基準')).toBeVisible();

    // AA基準の説明が表示されることを確認
    await expect(page.getByText('AA基準', { exact: true })).toBeVisible();
    await expect(
      page.getByText('文字のコントラスト比が最低でも4.5:1、大文字の場合は3:1'),
    ).toBeVisible();

    // AAA基準の説明が表示されることを確認
    await expect(page.getByText('AAA基準', { exact: true })).toBeVisible();
    await expect(
      page.getByText('文字のコントラスト比が最低でも7:1、大文字の場合は4.5:1'),
    ).toBeVisible();

    // 大文字の定義が表示されることを確認
    await expect(
      page.getByText(
        '大文字とは18pt（24px）以上、太字の場合は14pt（18.66px）以上を指します。',
      ),
    ).toBeVisible();
  });
});
