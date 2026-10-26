# apps/main-k8ordo CLAUDE.md

apps/main（Next）を k8ordo（`@k8ordo/framework` の `mode: 'static'`）で作り直している並走のアプリ。main と同じ Vercel のプロジェクトの preview にだけ出し、本番には出さない（`.github/workflows/vercel-prebuilt.yml` が push で拾わず、production では止める）。k8ordo の使い方は `node_modules/@k8ordo/framework/docs/` を読む。

## 置き場（src/）

- **routes/** - route ファイル（`page.tsx`・`layout.tsx`・`not-found.tsx`・`error.tsx`・`route.ts` など）だけを置く。ほかのファイルはビルドが拒むので、テストも置けない（route.ts の試験は `site/` に置く）。route ファイルは薄くし、`components/<area>` の部品と `features/*/interface` を読む。route.ts はどれも `Content-Type` を Response に書く（Vercel ではこの型で配られる）
- **components/<area>/** - 部品と、その CSS Modules。layout やページの CSS もここに置く。`<area>` は URL の区画の名前で、サイト全体で使うものは `site`。OG の絵（`site/og-image`）もここに置く
- **features/<feature>/** - 機能ごとの UI 以外の処理。`interface` は route と部品が読む関数、`application` は整形、`infrastructure` は DB の読み取り。ビルドはページを HTML とペイロードで2回描くので、interface の読み取りは `shared/cache/memoize-in-build.ts` で覚える（`vite dev` では覚えない）
- **site/** - `vercel()` の規則（`vercel-routes.ts`）・slug の正規表現・`paths` の組み立て・セキュリティヘッダー・ブラウザのターゲット。`vite.config.ts` が読むので、ここの import は拡張子まで書く
- **shared/** - アプリの中で横断して使う UI 以外の処理（api のクライアント、OG の PNG、llms.txt の中身など）
- **styles/** - `globals.css`
- **mocks/** - Storybook の MSW の既定のハンドラ。api の書き込みは 204、GET は 503 を返し、story が `msw.use` で決めない限り本番の api に出ない

記事・デモ・public は写さず、apps/main のもの（`../main/src/content`・`../main/src/playgrounds`・`../main/public`）を読む。記事とスライドの MDX は `shared/site/content-dir.ts` の根から、デモは alias の `@playgrounds` から読む。記事とデモが使う依存は apps/main と同じ実体であることを `src/shared-instances.test.ts` が確かめる。apps/main の共有のファイルを変えたときも main-k8ordo のキャッシュが外れるよう、`turbo.json` の `inputs` に共有のパスを並べている。

## 殻とページの head

- ルートレイアウトが `<html>`・`<head>`・`<body>` を書き、`<head>` にはどのページにも出す meta と link（manifest・icon・referrer など）を置く。`<title>` は書かない
- ページの title・description・canonical・og・twitter・RSS の alternate は、ページが `components/site/page-meta` の `PageMeta` を描いて書く（React が head へ上げる）。Next と違って親の値は継がれないので、OG の画像などは各ページが渡す
- エラーの画面（`components/site/error-fallback`・`components/site/root-error-boundary`）はページの PageMeta に替わって出るので、`<title>` を直に描く
- ルートレイアウトの部品（GlobalLayout・Provider など）の失敗は `routes/error.tsx` の外で起きるので、`components/site/root-error-boundary` が受けて api に送る
- k8ordo 1.1.0 は全 route ファイルを1つの rsc のチャンクにまとめるので、どの route ファイル（layout・error・page・not-found・route.ts）が静的に読むクライアントの部品と CSS も、どのページも読む。殻にはどのページにも要るものだけを置き、route.ts とそれが読むモジュールは `'use client'` や CSS に届くものを静的に import しない（`shared/site/llms-content.ts` は遅れて読む）
- dev だけで動かす部品（`components/site/react-scan`）は、部品の中で `import.meta.env.DEV` を見て、依存を動的に import する。描く側で `import.meta.env.DEV &&` としても、部品のモジュールは client のバンドルに入り、それが静的に読む依存の読み込みの処理も本番で走る

## vercel() の規則と dev

- 全応答のヘッダー・末尾スラッシュの 308・Accept での出し分け・`/reading-list/feed` の中継は、`src/site/vercel-routes.ts` を `vercel()` に渡して `.vercel/output/config.json` に書く。当たるのは Vercel だけで、`vite dev`・`vite preview` には当たらない
- Vercel は `src` をパスの全体に当てる（頭だけの `^/blog/` はどれにも当たらない）。どの `src` も `^` から `$` まで書く（`vercel-routes.test.ts` が確かめる）
- dev のセキュリティヘッダーは `vite.config.ts` のプラグインが付け、`/reading-list/feed` は `server.proxy` で中継する

## ビルドが読むもの

- 記事の下の URL（`/blog/:slug/article.md`・`/blog/:slug/og.png`）は、`vite.config.ts` の `paths` が、フィードと llms.txt と同じ公開済みの記事の一覧1つ（`features/blog/application/blogs.ts` の `getBlogs`）から作る。下書きと MDX の無い記事は挙がらず、404 になる。列挙した記事の route.ts が 200 を返さなければビルドが止まる
- `paths` は `vite.config.ts` の側で走る。設定のバンドルは `@repo/database` を外に出し、Node がそのまま読むと落ちるので、DB を読むモジュールは Vite の `runnerImport` で読む
- OG は route.ts の GET が satori と `@resvg/resvg-js` で PNG にする（`shared/og`）。フォントは `shared/og/fonts` に置いたものだけを使い、next/og と違ってビルドで足りない字形をネットから取らない。足りない字形があれば route.ts の GET が reject し、ビルドが止まる。字を足すときは `shared/og/fonts` にフォントを置く

## テストと Storybook

- Vitest の project は site・features・shared・components（部品の単体テスト）・dependencies と storybook
- Storybook は `@storybook/react-vite`（`pnpm -F main-k8ordo storybook`、port 6007）。Storybook と vitest の storybook の project は `.storybook/vite.config.ts` を読み、アプリの `vite.config.ts`（framework()・vercel()）は読まない
- テーマは toolbar か `parameters.theme` で決め、`ColorSchemeProvider` の `defaultPreference` に渡す。Story ごとに localStorage のテーマと `@k8ordo/state` の状態を消す
- VRT（`.github/workflows/vrt.yml`）は、apps/main に対応する story を apps/main のスクリーンショットと比べる。`app/_components` → `components/site`、`app/<area>/_components` → `components/<area>` に置き直すので、apps/main から写す story は、この置き場とファイル名・export 名を保つ。apps/main に無い story と、apps/main と違うことを許した story は、main-k8ordo の前回のスクリーンショットと比べる。許した story は vrt.yml の `OWN_BASELINE_KEYS` に並べる

## 環境変数

手元では `.env.example` を `.env.local` に写す。`GOOGLE_ANALYTICS_ID` があると、ルートレイアウトが GA の script と `ga-init.js`（apps/main の public）を読み、script に `data-count-navigations` を付けて、ページが替わった遷移ごとに page_view を送らせる。これは GA の管理画面で拡張計測の「ブラウザの履歴イベントに基づくページの変更」を切ってある前提で動く。k8ordo の router は push の遷移で pushState を呼ばないので拡張計測に拾われないが、戻る・進むは popstate で拾われ、設定を切らないと二重に数える。ビルドの描画でサーバーの部品が `process.env` を読むので、`vite.config.ts` が `.env.local` を `process.env` に読み込む。`.env` は git から外れないので使わない。ビルドは DB を読むので、`K8O_TURSO_*` が要る。

## 型

`.k8ordo/` の route の表と型は `vite build` か `vite dev` が書く（git に入れない）。CI では書かないので、`href()` の引数などの型は手元より緩い。

llms.txt が Playground のセクションを読むので、type-check はデモの TSX も通る。デモの CSS Modules の型は apps/main の `__generated__`（apps/main の `next typegen` が書く）を `tsconfig.json` の `rootDirs` で読む。main-k8ordo の type-check は、`turbo.json` の `dependsOn` で main の type-check（`next typegen`）を待つ。ルートの `turbo.json` は type-check の `outputs` に `__generated__` を入れているので、main の type-check がキャッシュに当たっても型が戻る。React と DOM の型の補い（`src/react.d.ts`・`src/dom.d.ts`）は apps/main と同じものを置く。
