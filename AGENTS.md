# AGENTS.md

このファイルは、AIエージェントがこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

k8oは個人ポートフォリオサイト。Next.js App Router + Turborepoモノレポ構成。ブログ(MDX)、トーク、開発者向けツール群を提供。

## コマンド

```bash
# 開発（ローカルDB含む全パッケージ起動）
pnpm run dev

# ビルド・品質チェック
pnpm run build                # 全パッケージビルド
pnpm run check                # Vite+ / OXC lint・format チェック
pnpm run check:write          # Vite+ / OXC lint・format 自動修正
pnpm run type-check           # TypeScript型チェック
pnpm run ls-lint              # ファイル名規約チェック

# テスト
pnpm run test                                           # 全テスト実行
pnpm run test -- --project="features test"              # feature系テストのみ
pnpm run test -- --project=storybook                    # Storybookテストのみ
pnpm run test -- apps/main/src/features/blog/application/blog.test.ts  # 単一ファイル

# Visual Regression Testing (storybook-addon-vrt)
pnpm -F main run test:vrt        # Storyごとのスクリーンショット撮影（adminも同様）
pnpm -F main exec svrt compare   # ベースラインと比較してレポート生成
pnpm -F main exec svrt approve   # 変更を新しいベースラインとして承認
# CIではmainのベースラインと比較し、PRコメントに差分要約とレポートのリンクを表示する

# Storybook
pnpm run -F main storybook    # Storybook起動 (port 6006)

# DB
pnpm run -F @repo/database migrate  # マイグレーション実行
```

## モノレポ構成

```
apps/main/          → Next.jsアプリ（メイン）            → apps/main/AGENTS.md
apps/admin/         → 管理サイト（Better Auth）          → apps/admin/AGENTS.md
packages/database/  → Drizzle ORM + Turso (libSQL)       → packages/database/AGENTS.md
packages/helpers/   → 共有ユーティリティ                  → packages/helpers/AGENTS.md
packages/typescript-config/ → 共有TS設定
packages/code-highlight/    → コードハイライト
```

各 app / package 固有の規約は、対応する `AGENTS.md` を参照すること。

パッケージ間依存:

- `apps/main` → `@repo/database`, `@repo/helpers`
- `apps/admin` → `@repo/database`, `@repo/helpers`

`@repo/database` の import 境界は現時点では規約で運用する。機械的な禁止ルールは、今後 Biome から oxc に置き換えるタイミングで導入する。

## 共通コーディング規約

### TypeScript

- `type` を使う（`interface` は使わない。module augmentation の `.d.ts` は例外）: OXC `typescript/consistent-type-definitions` で強制
- `enum` 禁止: OXC `typescript/no-enum` / `oxc/no-const-enum` で強制
- `any` 禁止、戻り値型は明示
- `forEach` 禁止（`for...of` を使う）

### ファイル命名

すべてkebab-case。ls-lintで検証。

### コメント・テスト記述

日本語を推奨。

## テスト戦略

| 対象 | 手法 | 場所 |
|------|------|------|
| Helpers | In-source testing (`if (import.meta.vitest)`) | `packages/helpers/src/**/*.ts` |
| Components | Storybook stories + play関数 | `apps/main/src/app/**/*.stories.tsx` |
| Features | Vitest unit tests | `apps/main/src/features/**/*.test.ts` |
| Shared | Vitest unit tests | `apps/main/src/shared/**/*.test.ts` |

テスト構造: `describe` で「正常系 / 異常系 / エッジケース」にグループ化。AAAパターン推奨。

ブラウザの挙動確認には `/next-browser` スキルを使用すること。

## コミットメッセージ

Conventional Commits形式: `<type>: <subject>`

type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## ブランチ戦略

- `main` - 本番 (Vercelデプロイ)
- `feature/*`, `fix/*`, `refactor/*`

## PR レビュー対応

- bot（k8o-bot など自動レビュアー）の inline コメントには **返信しない**。返信するとさらに自動レビューが走り、ノイズが増える
- bot レビューへの対応は、修正コミットを push するだけで完結させる（コメントスレッドの解決は人間が判断する）
- 人間レビュアーへの reply は通常通り行ってよい

## Git Hooks (vite-plus)

vite-plus (vp) 内蔵の hook 機構を使う。`vp config` が `.vite-hooks/_` にディスパッチャを生成し、`core.hooksPath` をそこに切り替える（pnpm install 時に自動実行）。

- **pre-commit** (`.vite-hooks/pre-commit`): `vp staged` + `pnpm run ls-lint`
  - `vp staged` は `vite.config.ts` の `staged` ブロックを参照し、対象ファイルに対して `vp check --fix` を実行（fixed は自動 stage）
- **pre-push** (`.vite-hooks/pre-push`): `vp check`
