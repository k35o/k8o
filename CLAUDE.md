# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

k8oは個人ポートフォリオサイト。Next.js App Router + Turborepoモノレポ構成。ブログ(MDX)、トーク、開発者向けツール群を提供。

## コマンド

```bash
# 開発
pnpm run dev                  # 全パッケージのdevサーバー起動（Turbo並列）
pnpm run -F @repo/database dev # Tursoローカルサーバー単体起動

# ビルド・品質チェック
pnpm run build                # 全パッケージビルド
pnpm run check                # Biome lint/format チェック
pnpm run check:write          # Biome lint/format 自動修正
pnpm run type-check           # TypeScript型チェック
pnpm run ls-lint              # ファイル名規約チェック

# テスト
pnpm run test                                           # 全テスト実行
pnpm run test -- --project="services test"              # サービステストのみ
pnpm run test -- --project=storybook                    # Storybookテストのみ
pnpm run test -- apps/main/src/services/blogs/blog.test.ts  # 単一ファイル

# Storybook
pnpm run -F main storybook    # Storybook起動 (port 6006)

# DB
pnpm run -F @repo/database migrate  # マイグレーション実行
```

## モノレポ構成

```
apps/main/          → Next.jsアプリ（メイン）
packages/database/  → Drizzle ORM + Turso (libSQL)
packages/helpers/   → 共有ユーティリティ（in-source testing）
packages/typescript-config/ → 共有TS設定
```

パッケージ間依存: `apps/main` → `@repo/database` → `@repo/helpers`

## アーキテクチャ

### レイヤー構成（apps/main/src/）

- **app/** - Presentation層。Next.js App Router、ページ・レイアウト・コンポーネント
  - `_api/`, `_components/`, `_utils/` はアプリ共通（`_` prefix = Next.jsルーティング対象外）
  - 各機能ディレクトリ(blog/, color-converter/等)内にも `_api/`, `_components/`, `_utils/` がある（機能専用）
  - `(articles)/` のような括弧はNext.jsルートグループ
- **services/** - Application層。ビジネスロジック
- **emails/** - React Emailテンプレート
- **mocks/** - MSWモック定義

### データベース（packages/database/）

Drizzle ORM + Turso (libSQL)。Conditional Export Mapsで環境切り替え:
- `storybook` → `__mocks__/db.ts`（モックDB）
- `node` / `default` → 実DBクライアント

## 技術スタック

- **Next.js 16** (App Router, RSC, `cacheComponents: true`, `viewTransition: true`, `typedRoutes: true`)
- **React 19**, **TypeScript 5.9** (strict)
- **TailwindCSS 4** + **@k8o/arte-odyssey**（UIライブラリ）
- **Drizzle ORM** + **Turso** (libSQL), **Zod** (バリデーション)
- **Biome** (linter/formatter), **Vitest** (テスト), **Storybook 10**, **Playwright**
- **MDX** + **rehype-katex** + **@shikijs/rehype** (ブログ記事)

## コーディング規約

### TailwindCSS：ArteOdysseyカスタムトークンのみ使用

```tsx
// ✅ Good
<div className="text-fg-base bg-bg-base">

// ❌ Bad（標準Tailwind禁止）
<div className="text-gray-900 bg-white">
```

### TypeScript

- `type` を使う（`interface` は使わない）: Biome `useConsistentTypeDefinitions` で強制
- `enum` 禁止: Biome `noEnum` で強制
- `any` 禁止、戻り値型は明示
- `forEach` 禁止（`for...of` を使う）: Biome `noForEach` で強制

### React/Next.js

- Server Componentsがデフォルト、必要な場合のみ `'use client'`
- 関数コンポーネントのみ: Biome `useReactFunctionComponents` で強制
- `forwardRef` 禁止: Biome `noReactForwardRef` で強制

### ファイル命名

すべてkebab-case。ls-lintで検証。

### コメント・テスト記述

日本語を推奨。

## テスト戦略

| 対象 | 手法 | 場所 |
|------|------|------|
| Helpers | In-source testing (`if (import.meta.vitest)`) | `packages/helpers/src/**/*.ts` |
| Components | Storybook stories + play関数 | `apps/main/src/app/**/*.stories.tsx` |
| Services | Vitest unit tests | `apps/main/src/services/**/*.test.ts` |

テスト構造: `describe` で「正常系 / 異常系 / エッジケース」にグループ化。AAAパターン推奨。

## コミットメッセージ

Conventional Commits形式: `<type>: <subject>`

type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## ブランチ戦略

- `main` - 本番 (Vercelデプロイ)
- `feature/*`, `fix/*`, `refactor/*`

## Git Hooks (Lefthook)

- **pre-commit**: `biome check --staged --no-errors-on-unmatched` + `ls-lint`（自動stage-fixed）
- **pre-push**: `biome check --changed --since=HEAD~1`
