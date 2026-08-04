# apps/main CLAUDE.md

メインのNext.jsアプリ。ブログ(MDX)、トーク、開発者向けツール群。

## レイヤー構成（src/）

- **app/** - Next.js App RouterのルーティングとUI composition
  - `page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts` などのNext.js entryを置く
  - UIコンポーネントは `app/**/_components` に置く。route専用ならroute配下、複数routeで使うなら `app/_components`
  - route localな状態・型・純粋utilityは `app/**/_state`, `app/**/_types`, `app/**/_utils` に置いてよい
  - `_api` は新規作成しない。Next.js entryからは `features/*/interface` を読む
- **features/** - 機能単位の非UIロジック
  - `features/<feature>/interface/` - Next.jsとの境界。`cacheLife`, `'use server'`, `FormData`, `Request`/`Response`向けのvalidationを置く
  - `features/<feature>/application/` - ユースケース・整形・機能固有の組み立て。小さい読み取り処理はここに置いてよい
  - `features/<feature>/infrastructure/` - DB、外部API、ファイルシステムなど外部接続の詳細。処理が太くなったら application からここへ切り出す
  - UIコンポーネントは置かない。UIは必ず `app/**/_components`
- **shared/** - apps/main 内で横断利用する非UI共通処理（認証、MDX、OGP、browser API、validation初期化、site metadataなど）。UIコンポーネントや `cn` は置かない
- **mocks/** - MSWモック定義

依存方向:

```txt
app -> features/*/interface -> features/*/application
features/*/application -> features/*/infrastructure
app -> app/**/_components
features/shared -> packages/helpers
```

Next.jsの機能やAPIは `apps/main/node_modules/next/dist/docs/` のバンドルドキュメントを参照すること。

## Cache 方針

Next.js の `cacheLife` は `features/*/interface` に置く。`app` のUIコンポーネントや `application` 層には原則として置かない。

- `cacheLife('minutes')` - 外部データ同期後に再検証される読み取りなど、短時間で鮮度が必要な一覧系
- `cacheLife('max')` - MDX metadata、静的な site metadata、ビルド時に近い安定データ

キャッシュを変更する Server Action / Route Handler は、更新対象の route に `revalidatePath` を明示する。

admin の Server Action や cron から更新されうる DB 由来のキャッシュ（talks / tags / blogs / slides の一覧・詳細、reading-list の記事・ソース一覧）には `cacheTag('db-content')`（`@/shared/cache/cache-tags`）を付与する。admin は書き込み・同期の成功後に `/api/revalidate`（`REVALIDATE_SECRET` で認可）を叩いてこのタグを再検証する。

browser-support（機能一覧）は admin の日次 cron が web-features の正典配布元（GitHub Releases）から取り込んで DB に保存し、main は `cacheTag('browser-support')` 付きの `'use cache'` で active データセットを読む。admin は同期成功後に `/api/revalidate` でこのタグを再検証する。ブラウザ最低版フロア（RootLayout が読む）だけは実行時 I/O を持たないコミット済み生成物で、`pnpm run -F main generate:browser-min-versions` で再生成する。

## Storybook MCP

apps/main のStorybook MCPは `main-storybook-mcp`。propsの確認手順はルートのCLAUDE.md「UI共通」を参照。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
