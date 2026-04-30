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
pnpm run check                # Biome lint/format チェック
pnpm run check:write          # Biome lint/format 自動修正
pnpm run type-check           # TypeScript型チェック
pnpm run ls-lint              # ファイル名規約チェック

# テスト
pnpm run test                                           # 全テスト実行
pnpm run test -- --project="features test"              # feature系テストのみ
pnpm run test -- --project=storybook                    # Storybookテストのみ
pnpm run test -- apps/main/src/features/blog/application/blog.test.ts  # 単一ファイル

# Storybook
pnpm run -F main storybook    # Storybook起動 (port 6006)

# DB
pnpm run -F @repo/database migrate  # マイグレーション実行
```

## モノレポ構成

```
apps/main/          → Next.jsアプリ（メイン）
apps/admin/         → 管理サイト（Better Auth + GitHub OAuth）
packages/database/  → Drizzle ORM + Turso (libSQL)
packages/helpers/   → 共有ユーティリティ（in-source testing）
packages/typescript-config/ → 共有TS設定
```

パッケージ間依存:

- `apps/main` → `@repo/database`, `@repo/helpers`
- `apps/admin` → `@repo/database`, `@repo/helpers`

## アーキテクチャ

### レイヤー構成（apps/main/src/, apps/admin/src/）

- **app/** - Next.js App RouterのルーティングとUI composition
  - `page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts` などのNext.js entryを置く
  - UIコンポーネントは `app/**/_components` に置く。route専用ならroute配下、複数routeで使うなら `app/_components`
  - route localな状態・型・純粋utilityは `app/**/_state`, `app/**/_types`, `app/**/_utils` に置いてよい
  - `_api` は新規作成しない。Next.js entryからは `features/*/interface` を読む
  - `(articles)/` のような括弧はNext.jsルートグループ
  - `apps/admin` でも `_actions` は新規作成せず、Server Actions は `features/*/interface` に置く
- **features/** - 機能単位の非UIロジック
  - `features/<feature>/interface/` - Next.jsとの境界。`cacheLife`, `'use server'`, `FormData`, `Request`/`Response`向けのvalidationを置く
  - `features/<feature>/application/` - ユースケース・整形・機能固有の組み立て。小さい読み取り処理はここに置いてよい
  - `features/<feature>/infrastructure/` - DB、外部API、ファイルシステムなど外部接続の詳細。処理が太くなったら application からここへ切り出す
  - UIコンポーネントは置かない。UIは必ず `app/**/_components`
- **shared/** - `apps/main` 内で横断利用する非UI共通処理
  - app固有の認証、MDX、OGP、browser API、validation初期化、site metadataなど
  - UIコンポーネントや `cn` は置かない
- **mocks/** - MSWモック定義

依存方向:

```txt
app -> features/*/interface -> features/*/application
features/*/application -> features/*/infrastructure
app -> app/**/_components
features/shared -> packages/helpers
```

`packages/helpers` はアプリ非依存の純粋helperを置く。`cn` はclassName文字列を合成するhelperなので `packages/helpers` に残す。

`@repo/database` の import 境界は現時点では規約で運用する。機械的な禁止ルールは、今後 Biome から oxc に置き換えるタイミングで導入する。

### Cache 方針

Next.js の `cacheLife` は `features/*/interface` に置く。`app` のUIコンポーネントや `application` 層には原則として置かない。

- `cacheLife('minutes')` - dashboard、admin の一覧、外部データ同期後に再検証される読み取りなど、短時間で鮮度が必要なもの
- `cacheLife('max')` - MDX metadata、静的な site metadata、ビルド時に近い安定データ

キャッシュを変更する Server Action / Route Handler は、更新対象の route に `revalidatePath` を明示する。

### データベース（packages/database/）

Drizzle ORM + Turso (libSQL)。Conditional Export Mapsで環境切り替え:
- `storybook` → `__mocks__/db.ts`（モックDB）
- `node` / `default` → 実DBクライアント

## コーディング規約

### TailwindCSS：ArteOdysseyカスタムトークンのみ使用

ArteOdysseyのドキュメントは `apps/main/node_modules/@k8o/arte-odyssey/docs/` を参照すること。

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

- Next.jsの機能やAPIについては `apps/main/node_modules/next/dist/docs/` のバンドルドキュメントを参照すること
- Server Componentsがデフォルト、必要な場合のみ `'use client'`
- 関数コンポーネントのみ: Biome `useReactFunctionComponents` で強制
- `forwardRef` 禁止: Biome `noReactForwardRef` で強制

### UIコンポーネント作業時のStorybook MCP利用

- UIコンポーネントを扱う作業では、回答や実装に入る前に必ず対象アプリに対応するStorybook MCPを使い、Storybook上のコンポーネント情報とドキュメントを確認すること
- `apps/main` のStorybookは `main-storybook-mcp` を使うこと
- `apps/admin` のStorybookは `admin-storybook-mcp` を使うこと
- **重要: コンポーネントのpropsを推測で使わないこと。** デザインシステムのコンポーネントでpropsを1つでも使う前に、`shadow` のような一般的に見える名前であっても、MCPツールでそのpropsが実際に定義されているか確認すること
- まず `list-all-documentation` を実行して、利用可能なコンポーネント一覧を取得すること
- 次に対象コンポーネントに対して `get-documentation` を実行し、利用可能なprops、説明、サンプルを確認すること
- 明示的にドキュメント化されているprops、またはサンプルStory内で使用されているpropsだけを使うこと
- propsがドキュメントに存在しない場合、命名規則や他ライブラリの慣習から推測して使ってはいけない。その場合はユーザーに確認すること
- Storyの新規作成や更新を行う前に、必ず `get-storybook-story-instructions` を実行して最新の作成ルールと推奨事項を確認すること
- 作業後は `run-story-tests` を実行して検証すること
- Story名と実際のprops名が一致しない場合があるため、Story名だけで判断せず、必ずドキュメントまたはサンプル実装でpropsを確認すること

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

## Git Hooks (Lefthook)

- **pre-commit**: `biome check --write --unsafe {staged_files}` + `ls-lint`（自動stage-fixed）
- **pre-push**: `biome check {staged_files}`
