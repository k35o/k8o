# apps/main CLAUDE.md

メインのNext.jsアプリ。ブログ(MDX)、トーク、開発者向けツール群。

## レイヤー構成（src/）

- **app/** - Next.js App RouterのルーティングとUI composition
  - `page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts` などのNext.js entryを置く
  - UIコンポーネントは `app/**/_components` に置く。route専用ならroute配下、複数routeで使うなら `app/_components`
  - route localな状態・型・純粋utilityは `app/**/_state`, `app/**/_types`, `app/**/_utils` に置いてよい
  - `_api` は作らない。Next.js entryからは `features/*/interface` を読む
- **features/** - 機能単位の非UIロジック
  - `features/<feature>/interface/` - Next.jsとの境界。`app` が読む関数と、`'use cache'`・`cacheLife`・`cacheTag` を置く
  - `features/<feature>/application/` - ユースケース・整形・機能固有の組み立て。小さい読み取り処理はここに置いてよい
  - `features/<feature>/infrastructure/` - DB、外部API、ファイルシステムなど外部接続の詳細。処理が太くなったら application からここへ切り出す
  - UIコンポーネントは置かない。UIは必ず `app/**/_components`
  - ブラウザからの書き込み（閲覧数・お問い合わせ・フィードバック・Push 購読・CSP 違反とエラーのレポート）は持たない。UIからは `shared/api/public-api.ts` の hc で api の公開ルート（`apps/api/CLAUDE.md`）を呼び、CSP 違反は `next.config.ts` の headers() で返す Reporting-Endpoints で api に送らせる。Server Action は作らない
- **shared/** - apps/main 内で横断利用する非UI共通処理（認証、MDX、OGP、browser API、api クライアント、site metadataなど）。UIコンポーネントや `cn` は置かない
- **mocks/** - Storybook の MSW ハンドラ（`handlers.ts`）と、features のテストで `next/cache` を差し替えるモック（`next-cache.ts`）

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

- `cacheLife('minutes')` - GitHub のコントリビューション、Push 通知の履歴、browser-support の機能一覧と最近の更新など、短時間で鮮度が必要な読み取り
- `cacheLife('hours')` - reading-list の記事・ソース一覧と、そのフィード
- `cacheLife('days')` - リンクカードの OGP メタデータと、api の同期後のタグ再検証で鮮度を保つ browser-support の active データセット
- `cacheLife('max')` - MDX metadata、静的な site metadata、`db-content` タグで再検証する talks / tags / blogs / slides、ビルド時に近い安定データ

`/api/revalidate` の Route Handler は、受け取ったタグを `revalidateTag` で再検証する。

DB 由来のキャッシュ（talks / tags / blogs / slides の一覧・詳細、reading-list の記事・ソース一覧）には `cacheTag('db-content')`（`@repo/helpers/cache/main-cache-tags`）を付与する。api（`apps/api`）は reading-list の同期後と、MCP の `set_blog_published` でブログの公開状態を変えたあとに `/api/revalidate`（`REVALIDATE_SECRET` で認可）を叩いてこのタグを再検証する。

browser-support（機能一覧）は api の日次 cron が web-features の正典配布元（GitHub Releases）から取り込んで DB に保存し、main は `cacheTag('browser-support')` 付きの `'use cache'` で active データセットを読む。api は同期成功後に `/api/revalidate` でこのタグを再検証する。ブラウザ最低版フロア（RootLayout が読む）だけは実行時 I/O を持たないコミット済み生成物で、`pnpm run -F main generate:browser-min-versions [version]` で再生成する。同じ版からリポジトリ直下の `.browserslistrc`（Next.js の Lightning CSS / SWC のターゲット）も生成するので、手で編集しない。active データセットとずれると外形監視（`.github/workflows/browser-support-monitor.yml`）が k8o-bot 名義で再生成 PR を作り、自動マージする。

## セキュリティヘッダー

`next.config.ts` の headers() が全ページに CSP・`Content-Security-Policy-Report-Only`・Reporting-Endpoints を返す。どちらの違反も `csp-endpoint`（api の `/public/reports`）に届き、api の MCP の `list_reports`（type は `csp-violation`）で読める。

Trusted Types は Report-Only で観測している。強制側の CSP は `trusted-types` で作れるポリシー名を縛るだけで、sink は縛らない。`require-trusted-types-for 'script'` と `default` を除いた `trusted-types` は Report-Only にだけ置く（dev では `require-trusted-types-for` を付けない）。default ポリシーは作らない。作ると sink に渡した文字列がそこで変換され、Report-Only の違反として上がらなくなる。生の文字列を渡した sink は、body の `disposition` が `report`、`effectiveDirective` が `require-trusted-types-for` のレポートになり、`sample` に sink 名と値の先頭が、`sourceFile` と行番号に呼び出し元が入る。

## Storybook MCP

apps/main のStorybook MCPは `main-storybook-mcp`。propsの確認手順はルートのCLAUDE.md「UI共通」を参照。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
