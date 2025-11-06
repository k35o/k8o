# Testing Guide

このドキュメントは、k8oプロジェクトのテスト戦略とガイドラインを説明します。

## 目次

- [テスト戦略](#テスト戦略)
- [テスト環境のセットアップ](#テスト環境のセットアップ)
- [テスト手法](#テスト手法)
  - [In-source Testing (Helpers)](#in-source-testing-helpers)
  - [Storybook Testing (Components)](#storybook-testing-components)
  - [Unit Testing (Services)](#unit-testing-services)
  - [E2E Testing (Playwright)](#e2e-testing-playwright)
- [テスト作成ガイドライン](#テスト作成ガイドライン)
- [モック戦略](#モック戦略)
- [カバレッジ](#カバレッジ)

## テスト戦略

k8oプロジェクトでは、コンポーネントの性質に応じて3つのテスト手法を使い分けます：

| テスト対象 | テスト手法 | ツール | 場所 |
|-----------|----------|--------|------|
| Helpers | In-source testing | Vitest | `packages/helpers/src/**/*.ts` |
| Components | Storybook stories | Storybook + Vitest | `core/src/app/**/*.stories.tsx` |
| Services | Unit tests | Vitest | `core/src/services/**/*.test.ts` |
| E2E | End-to-end tests | Playwright | `core/tests/**/*.spec.ts` |

### テストピラミッド

```
        ┌─────────────────┐
        │   E2E Tests     │ 少ない（重要なユーザーフロー）
        │   (Playwright)  │
        ├─────────────────┤
        │ Component Tests │ 中程度（UIコンポーネント）
        │  (Storybook)    │
        ├─────────────────┤
        │  Unit Tests     │ 多い（ビジネスロジック）
        │  (Vitest)       │
        └─────────────────┘
```

## テスト環境のセットアップ

### 依存関係のインストール

```bash
pnpm install --frozen-lockfile
```

### Playwrightのセットアップ

```bash
pnpm run install-playwright
```

### 環境変数

テスト用の環境変数を設定：

```bash
# core/.env.test
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/test"
KV_REST_API_URL="http://localhost:8079"
KV_REST_API_TOKEN="test_token"
```

### Dockerサービスの起動

```bash
docker compose up -d
```

## テスト手法

### In-source Testing (Helpers)

**対象**: `packages/helpers/src/` 配下のユーティリティ関数

**特徴**:
- テストコードと実装コードを同一ファイルに記述
- `if (import.meta.vitest)` ブロックを使用
- 高速で保守しやすい

**例**:

```typescript
// packages/helpers/src/number/add.ts
export function add(a: number, b: number): number {
  return a + b;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('add', () => {
    describe('正常系', () => {
      it('正の整数を正しく加算できる', () => {
        expect(add(1, 2)).toBe(3);
      });

      it('負の整数を正しく加算できる', () => {
        expect(add(-1, -2)).toBe(-3);
      });

      it('小数を正しく加算できる', () => {
        expect(add(0.1, 0.2)).toBeCloseTo(0.3);
      });
    });

    describe('異常系', () => {
      it('ゼロとの加算', () => {
        expect(add(5, 0)).toBe(5);
      });
    });

    describe('エッジケース', () => {
      it('非常に大きな数値', () => {
        expect(add(Number.MAX_SAFE_INTEGER, 1)).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
      });
    });
  });
}
```

**実行方法**:

```bash
# すべてのhelpersテスト
pnpm run test --project=helpers

# 特定のファイル
pnpm run test packages/helpers/src/number/add.ts

# ウォッチモード
pnpm run test --watch
```

**ベストプラクティス**:
- 日本語でテストケースを記述
- `describe`でグループ化（正常系/異常系/エッジケース）
- すべての分岐をカバー
- 境界値テストを含める

---

### Storybook Testing (Components)

**対象**: `core/src/app/_components/` 配下のUIコンポーネント

**特徴**:
- ビジュアルリグレッションテスト
- アクセシビリティテスト
- インタラクションテスト
- ブラウザ環境でのテスト

**例**:

```tsx
// core/src/app/_components/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './button';

const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: 'Click me',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // アクセシビリティチェック
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Click me');

    // インタラクション
    await userEvent.click(button);

    // 状態確認
    await expect(button).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    variant: 'primary',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();

    // クリック不可を確認
    await userEvent.click(button);
    await expect(button).not.toHaveFocus();
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    variant: 'primary',
    loading: true,
  },
};
```

**実行方法**:

```bash
# Storybookを起動
pnpm run -F core storybook

# Storybookテストを実行
pnpm run test --project=storybook

# ビジュアルリグレッションテスト（Chromatic）
pnpm run -F core chromatic
```

**ベストプラクティス**:
- すべての状態をストーリーで表現
  - デフォルト状態
  - ホバー/フォーカス状態
  - エラー状態
  - ローディング状態
  - 無効化状態
- `play`関数でインタラクションテスト
- アクセシビリティチェック（a11y addon）
- レスポンシブ対応のテスト

---

### Unit Testing (Services)

**対象**: `core/src/services/` 配下のビジネスロジック

**特徴**:
- ビジネスロジックの検証
- データベース操作のテスト
- 外部API統合のテスト
- モックを活用

**例**:

```typescript
// core/src/services/blogs/blog.test.ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { getBlog, createBlog } from './blog';
import { db } from '@/database/db';
import { blogs } from '@/database/schema';

describe('blog service', () => {
  beforeEach(async () => {
    // テストデータの準備
    await db.insert(blogs).values({
      id: 'test-blog-1',
      title: 'Test Blog',
      slug: 'test-blog',
      content: 'Test content',
      publishedAt: new Date(),
    });
  });

  afterEach(async () => {
    // クリーンアップ
    await db.delete(blogs).where(eq(blogs.id, 'test-blog-1'));
  });

  describe('getBlog', () => {
    describe('正常系', () => {
      it('存在するブログを取得できる', async () => {
        const blog = await getBlog('test-blog');

        expect(blog).toBeDefined();
        expect(blog?.id).toBe('test-blog-1');
        expect(blog?.title).toBe('Test Blog');
      });

      it('公開済みのブログのみ取得できる', async () => {
        // 未公開ブログを作成
        await db.insert(blogs).values({
          id: 'draft-blog',
          title: 'Draft Blog',
          slug: 'draft-blog',
          content: 'Draft content',
          publishedAt: null,
        });

        const blog = await getBlog('draft-blog');
        expect(blog).toBeNull();
      });
    });

    describe('異常系', () => {
      it('存在しないブログの場合はnullを返す', async () => {
        const blog = await getBlog('non-existent');
        expect(blog).toBeNull();
      });

      it('無効なスラッグの場合はエラーを投げる', async () => {
        await expect(getBlog('')).rejects.toThrow();
      });
    });
  });

  describe('createBlog', () => {
    it('新しいブログを作成できる', async () => {
      const newBlog = await createBlog({
        title: 'New Blog',
        slug: 'new-blog',
        content: 'New content',
      });

      expect(newBlog.id).toBeDefined();
      expect(newBlog.slug).toBe('new-blog');

      // データベースに保存されたことを確認
      const savedBlog = await getBlog('new-blog');
      expect(savedBlog).toBeDefined();
    });

    it('重複するスラッグの場合はエラーを投げる', async () => {
      await expect(createBlog({
        title: 'Duplicate',
        slug: 'test-blog', // 既存のスラッグ
        content: 'Content',
      })).rejects.toThrow();
    });
  });
});
```

**実行方法**:

```bash
# すべてのサービステスト
pnpm run test --project="services test"

# 特定のファイル
pnpm run test core/src/services/blogs/blog.test.ts

# カバレッジ付き
pnpm run coverage
```

**ベストプラクティス**:
- `beforeEach`/`afterEach`でテストデータの準備とクリーンアップ
- データベーストランザクションを使用（可能な場合）
- 外部APIはMSWでモック
- テストの独立性を保つ
- 非同期処理の適切なハンドリング

---

### E2E Testing (Playwright)

**対象**: ユーザーフロー全体

**特徴**:
- 実際のブラウザでのテスト
- ユーザー視点のテスト
- 複数ページにまたがるフロー

**例**:

```typescript
// core/tests/blog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ブログ機能', () => {
  test('ブログ一覧から記事詳細に遷移できる', async ({ page }) => {
    // ブログ一覧ページに移動
    await page.goto('/blog');

    // ページタイトルを確認
    await expect(page).toHaveTitle(/ブログ/);

    // 最初のブログ記事をクリック
    const firstArticle = page.locator('article').first();
    const articleTitle = await firstArticle.locator('h2').textContent();
    await firstArticle.click();

    // 記事詳細ページに遷移
    await expect(page.locator('h1')).toContainText(articleTitle || '');

    // ビューカウントが表示される
    await expect(page.locator('[data-testid="view-count"]')).toBeVisible();
  });

  test('コメントを投稿できる', async ({ page }) => {
    await page.goto('/blog/test-article');

    // コメントフォームに入力
    await page.fill('[name="author"]', 'テストユーザー');
    await page.fill('[name="content"]', 'テストコメント');

    // 送信
    await page.click('button[type="submit"]');

    // 成功メッセージ
    await expect(page.locator('[role="alert"]')).toContainText('コメントを投稿しました');

    // コメントが表示される
    await expect(page.locator('article').last()).toContainText('テストコメント');
  });

  test('タグでフィルタリングできる', async ({ page }) => {
    await page.goto('/blog');

    // タグをクリック
    await page.click('a[href*="?tag="]');

    // URLが変わる
    expect(page.url()).toContain('?tag=');

    // フィルタリングされた記事のみ表示
    const articles = page.locator('article');
    await expect(articles).not.toHaveCount(0);
  });
});

test.describe('アクセシビリティ', () => {
  test('ブログ一覧ページのa11y', async ({ page }) => {
    await page.goto('/blog');

    // axe-playwrightでチェック
    const { violations } = await injectAxe(page);
    expect(violations).toHaveLength(0);
  });
});
```

**実行方法**:

```bash
# すべてのE2Eテスト
pnpm run -F core test:e2e

# ヘッドレスモード
pnpm run -F core test:e2e --headed

# 特定のブラウザ
pnpm run -F core test:e2e --project=chromium

# デバッグモード
pnpm run -F core test:e2e --debug
```

**ベストプラクティス**:
- ユーザーの視点でテストを書く
- data-testid属性を使用（実装の詳細に依存しない）
- ページオブジェクトパターンを使用（大規模なテストの場合）
- タイムアウトを適切に設定
- スクリーンショットを活用

---

## テスト作成ガイドライン

### 命名規則

```typescript
// Good
describe('getUserById', () => {
  it('ユーザーIDから正しくユーザーを取得できる', () => {
    // ...
  });
});

// Bad
describe('test', () => {
  it('works', () => {
    // ...
  });
});
```

### AAA パターン (Arrange-Act-Assert)

```typescript
it('ブログ記事を作成できる', async () => {
  // Arrange: テストデータの準備
  const input = {
    title: 'Test Blog',
    slug: 'test-blog',
    content: 'Content',
  };

  // Act: 実行
  const result = await createBlog(input);

  // Assert: 検証
  expect(result.id).toBeDefined();
  expect(result.slug).toBe('test-blog');
});
```

### テストの独立性

```typescript
// Good: 各テストが独立している
describe('blog service', () => {
  it('ブログを取得できる', async () => {
    const blog = await createTestBlog();
    const result = await getBlog(blog.slug);
    expect(result).toBeDefined();
  });

  it('ブログを削除できる', async () => {
    const blog = await createTestBlog();
    await deleteBlog(blog.id);
    const result = await getBlog(blog.slug);
    expect(result).toBeNull();
  });
});

// Bad: テストが相互に依存している
let sharedBlog;

it('ブログを作成する', async () => {
  sharedBlog = await createBlog({ ... });
});

it('作成したブログを取得する', async () => {
  // sharedBlogに依存 - NG!
  const result = await getBlog(sharedBlog.slug);
});
```

### エラーケースのテスト

```typescript
describe('異常系', () => {
  it('無効な入力の場合はZodエラーを投げる', async () => {
    await expect(
      createBlog({ title: '', slug: 'test', content: 'test' })
    ).rejects.toThrow(ZodError);
  });

  it('データベースエラー時は適切なエラーを投げる', async () => {
    // データベース接続を切断
    await db.destroy();

    await expect(getBlog('test')).rejects.toThrow('Database connection failed');
  });
});
```

## モック戦略

### MSW (Mock Service Worker)

外部APIのモック：

```typescript
// core/src/mocks/handlers/microcms.ts
import { http, HttpResponse } from 'msw';

export const microCMSHandlers = [
  http.get('https://k35o.microcms.io/api/v1/news', () => {
    return HttpResponse.json({
      contents: [
        {
          id: 'news-1',
          title: 'Test News',
          content: 'Test content',
        },
      ],
    });
  }),

  http.get('https://k35o.microcms.io/api/v1/news/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test News',
      content: 'Test content',
    });
  }),
];
```

### Vitest Mock

関数のモック：

```typescript
import { vi } from 'vitest';
import * as emailService from '@/services/email';

describe('subscription', () => {
  it('メールを送信する', async () => {
    // メール送信をモック
    const sendEmailSpy = vi.spyOn(emailService, 'sendEmail')
      .mockResolvedValue({ success: true });

    await subscribe('test@example.com');

    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: '購読確認',
    });

    sendEmailSpy.mockRestore();
  });
});
```

### Conditional Import Maps

環境別のモック：

```json
{
  "imports": {
    "#database/db": {
      "test": "./src/mocks/db.mock.ts",
      "storybook": "./src/mocks/db.mock.ts",
      "default": "./src/database/db.ts"
    }
  }
}
```

## カバレッジ

### カバレッジの実行

```bash
# カバレッジレポート生成
pnpm run coverage

# カバレッジUIを起動
pnpm run test:ui
```

### カバレッジ目標

| カテゴリ | 目標 | 現状 |
|---------|------|------|
| Helpers | 90%+ | ✅ 95% |
| Services | 80%+ | ⚠️ 65% |
| Components | 70%+ | ❌ 32% |
| 全体 | 75%+ | ⚠️ 60% |

### カバレッジレポート

```bash
# HTMLレポート
open coverage/index.html

# ターミナル出力
pnpm run coverage -- --reporter=text
```

## CI/CD統合

### GitHub Actions

```yaml
# .github/workflows/ci.yml
- name: Run test
  run: pnpm run test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### Pre-push フック

```yaml
# lefthook.yml
pre-push:
  commands:
    test:
      glob: '*.test.{ts,tsx}'
      run: pnpm run test {staged_files}
```

## トラブルシューティング

### よくある問題

**1. テストがタイムアウトする**

```typescript
// タイムアウトを延長
it('時間のかかる処理', async () => {
  // ...
}, 10000); // 10秒
```

**2. データベーステストが失敗する**

```bash
# データベースをリセット
docker compose down -v
docker compose up -d
pnpm run -F core migrate
```

**3. Playwrightのブラウザが起動しない**

```bash
# ブラウザを再インストール
pnpm run install-playwright
```

---

詳細な実装例は各テストファイルを参照してください。
