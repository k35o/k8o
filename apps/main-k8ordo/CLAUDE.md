# apps/main-k8ordo CLAUDE.md

apps/main（Next）を k8ordo（`@k8ordo/framework` の `mode: 'static'`）で作り直している並走のアプリ。main と同じ Vercel のプロジェクトの preview にだけ出し、本番には出さない（`.github/workflows/vercel-prebuilt.yml` が push で拾わず、production では止める）。k8ordo の使い方は `node_modules/@k8ordo/framework/docs/` を読む。

## 置き場（src/）

- **routes/** - route ファイル（`page.tsx`・`layout.tsx`・`not-found.tsx`・`error.tsx`・`route.ts` など）だけを置く。ほかのファイルはビルドが拒む。route ファイルは薄くし、`components/<area>` の部品を描く
- **components/<area>/** - 部品と、その CSS Modules。layout やページの CSS もここに置く。`<area>` は URL の区画の名前で、サイト全体で使うものは `site`
- **site/** - `vercel()` の規則（`vercel-routes.ts`）・slug の正規表現・セキュリティヘッダー・ブラウザのターゲット。`vite.config.ts` が読むので、ここの import は拡張子まで書く
- **shared/** - アプリの中で横断して使う UI 以外の処理（api のクライアントなど）
- **styles/** - `globals.css`

記事・デモ・public は写さず、apps/main のもの（`../main/src/content`・`../main/src/playgrounds`・`../main/public`）を読む。記事とデモが使う依存は apps/main と同じ実体であることを `src/shared-instances.test.ts` が確かめる。apps/main の共有のファイルを変えたときも main-k8ordo のキャッシュが外れるよう、`turbo.json` の `inputs` に共有のパスを並べている。

## vercel() の規則と dev

- 全応答のヘッダー・末尾スラッシュの 308・Accept での出し分け・`/reading-list/feed` の中継は、`src/site/vercel-routes.ts` を `vercel()` に渡して `.vercel/output/config.json` に書く。当たるのは Vercel だけで、`vite dev`・`vite preview` には当たらない
- Vercel は `src` をパスの全体に当てる（頭だけの `^/blog/` はどれにも当たらない）。どの `src` も `^` から `$` まで書く（`vercel-routes.test.ts` が確かめる）
- dev のセキュリティヘッダーは `vite.config.ts` のプラグインが付け、`/reading-list/feed` は `server.proxy` で中継する

## 環境変数

手元では `.env.example` を `.env.local` に写す。ビルドの描画でサーバーの部品が `process.env` を読むので、`vite.config.ts` が `.env.local` を `process.env` に読み込む。`.env` は git から外れないので使わない。

## 型

`.k8ordo/` の route の表と型は `vite build` か `vite dev` が書く（git に入れない）。CI では書かないので、`href()` の引数などの型は手元より緩い。
