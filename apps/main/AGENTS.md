# apps/main AGENTS.md

メインのNext.jsアプリ。ブログ(MDX)、トーク、開発者向けツール群。

## レイヤー構成（src/）

- **app/** - Next.js App RouterのルーティングとUI composition
  - `page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts` などのNext.js entryを置く
  - UIコンポーネントは `app/**/_components` に置く。route専用ならroute配下、複数routeで使うなら `app/_components`
  - route localな状態・型・純粋utilityは `app/**/_state`, `app/**/_types`, `app/**/_utils` に置いてよい
  - `_api` は新規作成しない。Next.js entryからは `features/*/interface` を読む
  - `(articles)/` のような括弧はNext.jsルートグループ
- **features/** - 機能単位の非UIロジック
  - `features/<feature>/interface/` - Next.jsとの境界。`cacheLife`, `'use server'`, `FormData`, `Request`/`Response`向けのvalidationを置く
  - `features/<feature>/application/` - ユースケース・整形・機能固有の組み立て。小さい読み取り処理はここに置いてよい
  - `features/<feature>/infrastructure/` - DB、外部API、ファイルシステムなど外部接続の詳細。処理が太くなったら application からここへ切り出す
  - UIコンポーネントは置かない。UIは必ず `app/**/_components`
- **shared/** - apps/main 内で横断利用する非UI共通処理
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

## React/Next.js

- Next.jsの機能やAPIについては `apps/main/node_modules/next/dist/docs/` のバンドルドキュメントを参照すること
- Server Componentsがデフォルト、必要な場合のみ `'use client'`
- 関数コンポーネントのみ
- `forwardRef` 禁止

## Cache 方針

Next.js の `cacheLife` は `features/*/interface` に置く。`app` のUIコンポーネントや `application` 層には原則として置かない。

- `cacheLife('minutes')` - 外部データ同期後に再検証される読み取りなど、短時間で鮮度が必要な一覧系
- `cacheLife('max')` - MDX metadata、静的な site metadata、ビルド時に近い安定データ

キャッシュを変更する Server Action / Route Handler は、更新対象の route に `revalidatePath` を明示する。

admin の Server Action や cron から更新されうる DB 由来のキャッシュ（talks / tags / blogs / slides の一覧・詳細、baseline のブラウザ対応バージョン、reading-list の記事・ソース一覧）には `cacheTag('db-content')`（`@/shared/cache/cache-tags`）を付与する。admin は書き込み・同期の成功後に `/api/revalidate`（`REVALIDATE_SECRET` で認可）を叩いてこのタグを再検証する。

## TailwindCSS：ArteOdysseyカスタムトークンのみ使用

ArteOdysseyのドキュメントは `apps/main/node_modules/@k8o/arte-odyssey/docs/` を参照すること。

```tsx
// ✅ Good
<div className="text-fg-base bg-bg-base">

// ❌ Bad（標準Tailwind禁止）
<div className="text-gray-900 bg-white">
```

## UIコンポーネント作業時のStorybook MCP利用

apps/main のStorybookは **`main-storybook-mcp`** を使うこと。

- UIコンポーネントを扱う作業では、回答や実装に入る前に必ず `main-storybook-mcp` を使い、Storybook上のコンポーネント情報とドキュメントを確認すること
- **重要: コンポーネントのpropsを推測で使わないこと。** デザインシステムのコンポーネントでpropsを1つでも使う前に、`shadow` のような一般的に見える名前であっても、MCPツールでそのpropsが実際に定義されているか確認すること
- まず `list-all-documentation` を実行して、利用可能なコンポーネント一覧を取得すること
- 次に対象コンポーネントに対して `get-documentation` を実行し、利用可能なprops、説明、サンプルを確認すること
- 明示的にドキュメント化されているprops、またはサンプルStory内で使用されているpropsだけを使うこと
- propsがドキュメントに存在しない場合、命名規則や他ライブラリの慣習から推測して使ってはいけない。その場合はユーザーに確認すること
- Storyの新規作成や更新を行う前に、必ず `get-storybook-story-instructions` を実行して最新の作成ルールと推奨事項を確認すること
- 作業後は `run-story-tests` を実行して検証すること
- Story名と実際のprops名が一致しない場合があるため、Story名だけで判断せず、必ずドキュメントまたはサンプル実装でpropsを確認すること
