// spec: moji-count-test-plan.md
// seed: core/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('もじカウントアプリケーションのE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // もじカウントページに直接アクセス（baseURLからの相対パス）
    await page.goto('/moji-count');
  });

  test('ページの初期状態を確認', async ({ page }) => {
    // ページタイトルが「もじカウント」と表示されることを確認
    await expect(
      page.getByRole('heading', { name: 'もじカウント' }),
    ).toBeVisible();

    // 初期状態でテキストエリアが空であることを確認
    await expect(
      page.getByRole('textbox', { name: 'カウントしたい文字列' }),
    ).toHaveValue('');

    // 文字数ラベルが表示されることを確認
    await expect(page.getByText('文字数：')).toBeVisible();

    // 初期文字数が0と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('0');
  });

  test('英数字の文字数カウント - Hello World', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 英数字「Hello World」を入力
    await textbox.fill('Hello World');

    // 「Hello World」の文字数が11と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('11');
  });

  test('ひらがなの文字数カウント - こんにちは', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // ひらがな「こんにちは」を入力
    await textbox.fill('こんにちは');

    // 「こんにちは」の文字数が5と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('5');
  });

  test('カタカナの文字数カウント - コンニチハ', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // カタカナ「コンニチハ」を入力
    await textbox.fill('コンニチハ');

    // 「コンニチハ」の文字数が5と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('5');
  });

  test('漢字の文字数カウント - 今日は良い天気', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 漢字「今日は良い天気」を入力
    await textbox.fill('今日は良い天気');

    // 「今日は良い天気」の文字数が7と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('7');
  });

  test('混合文字列の文字数カウント - Hello世界123あいう', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 混合文字列「Hello世界123あいう」を入力
    await textbox.fill('Hello世界123あいう');

    // 「Hello世界123あいう」の文字数が13と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('13');
  });

  test('基本的な絵文字の文字数カウント - 😀😃😄', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 基本的な絵文字「😀😃😄」を入力
    await textbox.fill('😀😃😄');

    // 「😀😃😄」の文字数が3と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('3');
  });

  test('記号の文字数カウント - !@#$%^&*()', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 記号「!@#$%^&*()」を入力
    await textbox.fill('!@#$%^&*()');

    // 「!@#$%^&*()」の文字数が10と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('10');
  });

  test('絵文字と文字の混合カウント - こんにちは😀世界🌍', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 混合文字列「こんにちは😀世界🌍」を入力
    await textbox.fill('こんにちは😀世界🌍');

    // 「こんにちは😀世界🌍」の文字数が9と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('9');
  });

  test('空文字列の文字数カウント', async ({ page }) => {
    // 空文字列の場合、文字数が0と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('0');
  });

  test('半角スペースの文字数カウント', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 半角スペース5つを入力
    await textbox.fill('     ');

    // 半角スペース5つの文字数が5と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('5');
  });

  test('長文の文字数カウント - 1000文字', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 「あ」を1000回繰り返した長文を入力
    await textbox.fill('あ'.repeat(1000));

    // 1000文字の長文の文字数が1000と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('1000');
  });

  test('特殊ユニコード文字の文字数カウント - 𠮷野家', async ({ page }) => {
    const textbox = page.getByRole('textbox', { name: 'カウントしたい文字列' });

    // 特殊ユニコード「𠮷野家」を入力
    await textbox.fill('𠮷野家');

    // 「𠮷野家」の文字数が3と表示されることを確認
    await expect(page.locator('p.font-bold.text-xl')).toHaveText('3');
  });
});
