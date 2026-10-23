# apps/main CLAUDE.md

メインのNext.jsアプリ。ブログ(MDX)、トーク、開発者向けツール群。

## レイヤー構成（src/）

- **app/** - Next.js App RouterのルーティングとUI composition
  - `page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts` などのNext.js entryを置く
  - UIコンポーネントは `app/**/_components` に置く。route専用ならroute配下、複数routeで使うなら `app/_components`
  - route localな状態・型・純粋utilityは `app/**/_state`, `app/**/_types`, `app/**/_utils` に置いてよい
  - `_api` は作らない。Next.js entryからは `features/*/interface` を読む
- **features/** - 機能単位の非UIロジック
  - `features/<feature>/interface/` - Next.jsとの境界。`app` が読む関数と、`'use cache'`・`cacheLife` を置く
  - `features/<feature>/application/` - ユースケース・整形・機能固有の組み立て。小さい読み取り処理はここに置いてよい
  - `features/<feature>/infrastructure/` - DB、外部API、ファイルシステムなど外部接続の詳細。処理が太くなったら application からここへ切り出す
  - UIコンポーネントは置かない。UIは必ず `app/**/_components`
  - ブラウザからの書き込み（閲覧数・お問い合わせ・フィードバック・Push 購読・CSP 違反とエラーのレポート）は持たない。UIからは `shared/api/public-api.ts` の hc で api の公開ルート（`apps/api/CLAUDE.md`）を呼び、CSP 違反は `next.config.ts` の headers() で返す Reporting-Endpoints で api に送らせる。Server Action は作らない
  - ブラウザで api の公開の GET の値に差し替える表示は、server の部品がビルド時の値を読んで client の部品に渡し、client の部品が `shared/api/live-snapshot.ts` の `useLiveSnapshot` で差し替える。GET は `shared/api/public-api.ts` の `readOrNull` で読み、読めなければビルド時の値のまま描く
- **content/** - ブログ記事の中身。`content/blog/<slug>/` に `article.mdx` と、その記事だけが使う `_images/`・`_components/`・`article.module.css` を置く
  - `app/blog/[slug]/page.tsx` が公開済みの記事を `generateStaticParams` で挙げ、MDX を動的 import して描く。OG は `app/blog/[slug]/og.png/route.ts`。記事ごとの `layout.tsx`・`opengraph-image.tsx` は作らない
  - 記事が使う部品（`BrowserSupportStatus`・`PlaygroundEmbed`・`Playground`・`LinkCard`・`Image`・`FloatImage`・`Alert`）は `app/blog/_components/blog-mdx-components` の `blogMdxComponents` で渡す。MDX は `@/app/...` を import しない（`features/blog/application/article-files.test.ts` が確かめる）。相対の import（`./_images`・`./_components`・`./article.module.css`）と、パッケージの import は使ってよい
  - 見出し・段落・リンク・コードなどの部品は `app/_components/mdx-base`。ルートの `mdx-components.tsx` はこれだけを返し、スライドの MDX も使う
- **shared/** - apps/main 内で横断利用する非UI共通処理（MDX、OGP、browser API、api クライアント、site metadataなど）。UIコンポーネントや `cn` は置かない
- **mocks/** - Storybook の MSW ハンドラ（`handlers.ts`）と、features のテストで `next/cache` を差し替えるモック（`next-cache.ts`）。api への GET は既定で 503 を返すので、差し替える表示はビルド時の値のまま描かれる。差し替えを確かめる story だけが `beforeEach` の `msw.use` で応答を決める

依存方向:

```txt
app -> features/*/interface -> features/*/application
features/*/application -> features/*/infrastructure
app -> app/**/_components
app -> content
features/shared -> packages/helpers
```

Next.jsの機能やAPIは `apps/main/node_modules/next/dist/docs/` のバンドルドキュメントを参照すること。

## Cache 方針

Next.js の `cacheLife` は `features/*/interface` に置く。`app` のUIコンポーネントや `application` 層には原則として置かない。

- `cacheLife('days')` - リンクカードの OGP メタデータ
- `cacheLife('max')` - DB の talks / tags / blogs / slides、browser-support の active データセットと最近の更新、reading-list の記事・ソース一覧、Push 通知の履歴、MDX metadata、静的な site metadata、ビルド時に近い安定データ

表示はビルド時に固め、タグによるオンデマンドの再検証はしない（`cacheTag` は付けない）。talks / tags / blogs / slides と記事の公開・非公開はマイグレーションでだけ変わり、本番ではマイグレーションを流したあとに main をビルドして出すので、デプロイで新しくなる。日々変わる browser-support・reading-list・通知の履歴は、ブラウザで api の公開の GET の値に差し替える。

reading-list は、main がビルド時に記事・ソース一覧を読んで描き、ブラウザで api の `GET /public/reading-list` の値に差し替える。フィード（`/reading-list/feed`）は main では作らず、`next.config.ts` の rewrites で api の `GET /public/reading-list/feed` を中継する。中継した応答を main の CDN に持たせるため、headers で `x-vercel-enable-rewrite-caching: 1`（2026-04-06 より前に作ったプロジェクトの opt-in）と `Vercel-CDN-Cache-Control` を付ける。api の CDN は `s-maxage`・`stale-while-revalidate`・`stale-if-error` を外して `public, max-age=300` だけを返すので、main の CDN での寿命は `Vercel-CDN-Cache-Control` で決める。このヘッダーは main の CDN が使って取り除くので、リーダーに届く Cache-Control は `public, max-age=300` のまま。

browser-support（機能一覧）は api の日次 cron が web-features の正典配布元（GitHub Releases）から取り込んで DB に保存する。main はビルド時に active データセットと最近の更新を読んで描き、ブラウザで api の値に差し替える。`/browser-support` は `GET /public/browser-support`、記事の `<BrowserSupportStatus>` とかどまるラボの対応状況は `GET /public/browser-support/features/:featureId` を読む。ブラウザ最低版フロア（RootLayout が読む）だけは実行時 I/O を持たないコミット済み生成物で、`pnpm run -F main generate:browser-min-versions [version]` で再生成する。同じ版からリポジトリ直下の `.browserslistrc`（Next.js の Lightning CSS / SWC のターゲット）も生成するので、手で編集しない。active データセットとずれると外形監視（`.github/workflows/browser-support-monitor.yml`）が k8o-bot 名義で再生成 PR を作り、自動マージする。

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
