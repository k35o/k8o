# apps/main-k8ordo CLAUDE.md

apps/main（Next）を k8ordo（`@k8ordo/framework` の `mode: 'static'`）で作り直している並走のアプリ。main と同じ Vercel のプロジェクトの preview にだけ出し、本番には出さない（`.github/workflows/vercel-prebuilt.yml` が push で拾わず、production では止める）。k8ordo の使い方は `node_modules/@k8ordo/framework/docs/` を読む。

## 置き場（src/）

- **routes/** - route ファイル（`page.tsx`・`layout.tsx`・`not-found.tsx`・`error.tsx`・`route.ts` など）だけを置く。ほかのファイルはビルドが拒むので、テストも置けない（route.ts の試験は `site/` に置く）。route ファイルは薄くし、`components/<area>` の部品と `features/*/interface` を読む。route.ts はどれも `Content-Type` を Response に書く（Vercel ではこの型で配られる）
- **components/<area>/** - 部品と、その CSS Modules。layout やページの CSS もここに置く。`<area>` は URL の区画の名前で、サイト全体で使うものは `site`。OG の絵（`site/og-image`）もここに置く
- **features/<feature>/** - 機能ごとの UI 以外の処理。`interface` は route と部品が読む関数、`application` は整形、`infrastructure` は DB の読み取り。ビルドはページを HTML とペイロードで2回描くので、interface の読み取りは `shared/cache/memoize-in-build.ts` で覚える（`vite dev` では覚えない）
- **site/** - `vercel()` の規則（`vercel-routes.ts`）・slug の正規表現・`paths` の組み立て・ビルドの後の検査・セキュリティヘッダー・ブラウザのターゲット。`vite.config.ts` が読むので、ここの import は拡張子まで書く
- **shared/** - アプリの中で横断して使う UI 以外の処理（api のクライアント、OG の PNG、llms.txt の中身など）
- **styles/** - `globals.css`
- **mocks/** - Storybook の MSW の既定のハンドラ。api の書き込みは 204、GET は 503 を返し、story が `msw.use` で決めない限り本番の api に出ない

記事・デモ・public は写さず、apps/main のもの（`../main/src/content`・`../main/src/playgrounds`・`../main/public`）を読む。記事のページは記事の MDX を alias の `@content` から import し、markdown・frontmatter・目次のように MDX を文字列で読むところは `shared/site/content-dir.ts` の根から読む。デモは alias の `@playgrounds` から読む。記事とデモが使う依存は apps/main と同じ実体であることを `src/shared-instances.test.ts` が確かめる。apps/main の共有のファイルを変えたときも main-k8ordo のキャッシュが外れるよう、`turbo.json` の `inputs` に共有のパスを並べている。

## 殻とページの head

- ルートレイアウトが `<html>`・`<head>`・`<body>` を書き、`<head>` にはどのページにも出す meta と link（manifest・icon・referrer など）を置く。`<title>` は書かない
- ページの title・description・canonical・og・twitter・RSS の alternate は、ページが `components/site/page-meta` の `PageMeta` を描いて書く（React が head へ上げる）。Next と違って親の値は継がれないので、OG の画像などは各ページが渡す
- エラーの画面（`components/site/error-fallback`・`components/site/root-error-boundary`）はページの PageMeta に替わって出るので、`<title>` を直に描く
- ルートレイアウトの部品（GlobalLayout・Provider など）の失敗は `routes/error.tsx` の外で起きるので、`components/site/root-error-boundary` が受けて api に送る
- page・not-found・route.ts はリクエストが届いたときに読まれ、それが静的に読むクライアントの部品と CSS（サーバーの部品の CSS Modules を含む）は、そのページだけが読む。layout・error が静的に読むものは、どのページも読む（`routes/blog/layout.tsx` のものもトップと 404 が読む）。殻にはどのページにも要るものだけを置く。区画の見出しと説明と幅（apps/main の `app/tags/layout.tsx`）のように、その区画のページだけが要る枠も layout.tsx に置かず、部品（`components/tags/tags-frame`・`components/slides/slides-frame`）にしてページが描く
- page・not-found が import する CSS と副作用は、そのページを読んでから効き、読んだあとはそのタブ（ビルドと dev ではそのプロセス）に残ってほかのページにも効く。ほかのページも当てにするもの（`globals.css`・フォント・`@/i18n`）はルートの layout で import する。そのページだけが使う CSS（記事の MDX が読む KaTeX の CSS、mdx-base が読むコードハイライトの CSS）はページの側に置く。置けるのは、ほかのページの見た目を変えないものに限る（KaTeX とコードハイライトの CSS が見た目を決めるのは、`.katex`・`.shiki`・`.code-annotate-*` などのクラスの要素だけ）
- head の CSS は、直に開いても遷移で着いても、サーバーの部品の CSS（先頭はルートの layout が import する `globals.css`）が前、クライアントの部品の CSS が後に並ぶ（k8ordo の docs の routing.md の「How a page is sent」）。この並びのために framework が中身の無い `<style>` を head に 1 つ書き、CSP は `style-src` の `'unsafe-inline'` でそれを通す。遷移や先読みで初めて読むクライアントの部品の CSS は head の末尾に、遷移で初めて読むサーバーの部品の CSS はサーバーの部品の CSS の後ろに足され、一度読んだ CSS はそのタブから外れない。クライアントの部品の CSS どうしの並びは保証されず、サーバーの部品の CSS どうしも、遷移で着いたページでは前のページで読んだファイルが前に残る。main-k8ordo の src の CSS Modules は `@layer components` に入り（`better-css-modules.config.ts`）、@k8ordo/ui の部品の CSS も同じ層にあるので、同じ詳細度の規則の勝ち負けは並びで決まる。サーバーの部品とクライアントの部品の CSS では、どの開き方でもクライアントの部品の規則が勝つ。層の順は、head の先頭の `globals.css` が読む `@k8ordo/ui/styles.css` が決める。`@content`・`@playgrounds` から読む記事とデモの CSS Modules は、`better-css-modules.config.ts` のあるディレクトリの外にあるので層に入らず、並びに関係なく層の中の規則に勝つ（apps/main では同じモジュールが `@layer components` に入るので、勝ち負けが違う）。同じ要素に別のモジュールの class を重ねるとき（`TableOfContentsSideRail` のように `cn(styles.root, className)` で外から class を受ける部品）は、両方で同じプロパティを書かない
- router は、同じ route の別の値へ移るとき（`/blog/a` から `/blog/b` など）、ページの木を作り直さずに次の値の props で描き直す。Next のように値ごとに部品の状態を初めに戻すため、動的なページは描く部分の根の要素に値で key を付ける（記事は `BlogLayoutContent` の `ArticleFrame`、タグは `TagContent`、デッキは `SlideArticle`）
- router は、layout の外へ移ると、その layout から下の部品を DOM ごと捨てる（Next は前の route を DOM ごと隠した Activity で残すので、外へ出て戻っても部品の状態も要素のスクロールも残る）。ページを移っても保つ状態（縦書きの切り替え）の Provider は、使うページの layout ではなくルートの layout に置く。ルートに置いて保てるのは React の状態だけで、DOM の状態（縦書きの本文の横のスクロールなど）は戻らない。殻にはどのページにも要るものだけを置く、という決まりの例外
- dev だけで動かす部品（`components/site/react-scan`）は、部品の中で `import.meta.env.DEV` を見て、依存を動的に import する。描く側で `import.meta.env.DEV &&` としても、部品のモジュールは client のバンドルに入り、それが静的に読む依存の読み込みの処理も本番で走る

## 記事の MDX

- MDX は `vite.config.ts` の `@mdx-js/rollup`（`enforce: 'pre'`）が JSX にする。remark・rehype は `@repo/mdx-preset` の preset で、apps/main と同じ
- 記事のページ（`routes/blog/[slug]/page.tsx`）は、`components/blog/blog-article` が `import.meta.glob` で集めた MDX を slug ごとに遅れて読み、`components/site/mdx-base` の `MdxContent` で描く。`MdxContent` は mdx-base の部品（見出し・コードブロックなど）に、渡された部品（記事は `components/blog/blog-mdx-components` の Alert・LinkCard など）を重ねる。MDX は `@/`・`next` を import しない（apps/main の規約のまま）
- plugin-rsc が import した CSS を載せる包みを付けるのは、CSS を静的に import する `.tsx` などのモジュールが export する、大文字で始まる関数の部品だけ。包んだ部品が、自分の import の木（build ではそれが入るチャンク）の CSS を載せる。だから、MDX を描く部品と、それが読む CSS（mdx-base の CSS Modules とコードハイライトの `@repo/code-highlight/styles.css`）は mdx-base に置く。部品の表だけを export して呼ぶ側で描くと、dev のページにその CSS が載らない
- `.mdx` は包まれないので、glob に `?vite-rsc-css-export=default` を付けて default も包ませる。外すと、記事が読む KaTeX の CSS と記事の CSS Modules が HTML に載らない。ビルドの後に `site/katex-css-guard.ts` が、KaTeX の CSS を import する記事の HTML にその CSS が載っているかを見て、載っていなければビルドを止める
- ページの切り替えでは、移る先が `<ViewTransition>`（コードのタブ）を含んでいても、文書の view transition は始まらない。始まるのは、ページの中でタブを切り替えたとき

## Playground

- デモのセクションは、`components/playgrounds/load-section.ts` が `import.meta.glob('@playgrounds/*/index.ts')` で id ごとに遅れて読む。`/playgrounds/:id` の page と OG の route.ts、記事の `PlaygroundEmbed` は、どれもこれで読む。新しいデモで書き足すのは apps/main の `ids.ts` と `sections.ts` だけ
- デモは、サーバーの部品（`PlaygroundEmbed`・`SectionDemos`）が `@playgrounds/playground` の枠で包んで描く。`'use client'` のデモはクライアントの部品として、それ以外のデモと枠はサーバーの部品として、その CSS がそのページの HTML に載る
- 記事の部品の表（`blogMdxComponents`）は記事のページが静的に読むので、表に置く `PlaygroundEmbed` と `Playground`（`LazyPlayground`）は、枠とデモを関数の中で読む。静的に読むと、デモの無い記事も枠の CSS を読む
- `/blog/:slug`・`/playgrounds/:id`・`/playgrounds` の route と、それが静的に読む部品は、`@playgrounds/sections` と `@playgrounds`（`index.ts`）を静的に読まない。記事と `/playgrounds/:id` で読むと、デモが id ごとのチャンクに分かれず、どのデモのページも全部のデモを読む。デモを描かない一覧（`PlaygroundsIndex`）で読むと、サーバーで描くデモの CSS を一覧も読むので、関数の中で読む。llms.txt の route.ts は HTML を書かないので、静的に読んでよい

## 一覧（`/blog`・`/playgrounds`）

- 検索の `q` は一覧ごとの `definePageState` の url に置き、打つたびに `update()`（既定の replace）で書く。入力は `q` をそのまま出し、絞り込みと群（年・カテゴリ）の組み立てだけを `useDeferredValue` で遅らせる
- static mode では HTML は既定値（全件）で、`?q=` は hydrate のあとに効く。hydrate の前に欄へ打った文字は、欄が付いた時に `q` へ写す（`shared/browser/replay-typed-value.ts` を欄の `ref` に渡す）
- 一覧のカードのリンクは `href()` で組んだ素の `<a>` にする。`components/site/content-card` の `ContentCard` は、呼ぶ側が `href()` で組んだパスを `href` で受ける

## スライド

- デッキの route は `/slides/:slug` の 1 本（何を書くかは「ビルドが読むもの」）。MDX は `components/slides/slide-article` が記事と同じく `import.meta.glob`（`?vite-rsc-css-export=default` 付き）で slug ごとに遅れて読み、`MdxContent` にスライドの部品の表を重ねて描く。MDX の `<SlideDeckShell slug>` は QR の URL と同期の名前になるので、ディレクトリ名と同じにする（apps/main の `slide-files.test.ts` が確かめる）
- 発表者モードかどうか（`mode`）と、観覧と発表者の生存の知らせの名前（`session`）は `definePageState('slide-deck')` の url に置く。表示する枚の `#<番号>` は state に置き場が無いので、`use-hash-index` が `history.replaceState` と `hashchange` で読み書きする。`history.replaceState(null)` は Navigation API の entry の state も消すので、ルートの layout に entry に置くページの状態を足すと、デッキはページ送りのたびにそれを消す
- static mode の HTML は url の state を既定値で描くので、デッキ全体を `BrowserOnly`（`use(browser())` を Suspense で包む）でブラウザでだけ描く。HTML の `<main>` は見出しの Slides と、空の digest の `<!--$!-->` が 1 つになる
- router は移る先の URL を先に書き、着くまで前のページを画面に残す。`@k8ordo/state` を通さずに URL を直に書く部品（デッキの `#<番号>`）は、そのあいだもキーや BroadcastChannel で動くので、開いたときの pathname を離れたら書かない。そのあいだは url の state も移る先の値になり、それで付け替わる部品は移るあいだに新しく付く（発表者のタブでは `DeckPresenter` に替わって `DeckViewer` が付く）。だから開いたときの pathname は、部品ごとではなく url の state で付け替わらない根（デッキの `Deck`）で覚えて渡す
- `SlideDeckShell` は MDX の子を `hr` で区切り、`Notes` を関数に付けた `$$slideRole` で見分けて、クライアントの `SlideDeck` に渡す。`Notes` は関数の宣言や式で export しない。CSS を import するモジュールでそう書くと、plugin-rsc が CSS を載せる包みの関数に替え、`$$slideRole` が外れてノートが本文に出る

## vercel() の規則と dev

- 全応答のヘッダー・末尾スラッシュの 308・Accept での出し分け・`/reading-list/feed` の中継は、`src/site/vercel-routes.ts` を `vercel()` に渡して `.vercel/output/config.json` に書く。当たるのは Vercel だけで、`vite dev`・`vite preview` には当たらない
- Vercel は `src` をパスの全体に当てる（頭だけの `^/blog/` はどれにも当たらない）。どの `src` も `^` から `$` まで書く（`vercel-routes.test.ts` が確かめる）
- dev のセキュリティヘッダーは `vite.config.ts` のプラグインが付け、`/reading-list/feed` は `server.proxy` で中継する

## ビルドが読むもの

- 記事のページと記事の下の URL（`/blog/:slug`・`/blog/:slug/article.md`・`/blog/:slug/og.png`）は、`vite.config.ts` の `paths` が、フィードと llms.txt と同じ公開済みの記事の一覧1つ（`features/blog/application/blogs.ts` の `getBlogs`）から作る。下書きと MDX の無い記事は挙がらず、404 になる。列挙した記事の route.ts が 200 を返さなければビルドが止まる
- Playground のページと OG（`/playgrounds/:id`・`/playgrounds/:id/og.png`）は、`paths` が apps/main の `playgrounds/ids.ts` から作る。記事の `PlaygroundEmbed` が無いセクションやデモを名指すと、描画が投げてビルドが止まる
- タグのページ（`/tags/:id`）は、`paths` が DB の全タグの id（`features/tags/application/tags.ts` の `getTags`）から作る。Next と同じく、中身が 0 件のタグ（下書きの記事だけのタグ）のページも書く。id は route の `paramsSchema` で正の整数に読むので、ページも `href('/tags/:id', { id })` も数値を受ける。挙げていない id と数字でない値は 404 になる。`vite dev` は `paths` を見ずにスキーマで読むので、ビルドでは 404 の `/tags/01` も dev では描く
- デッキのページと OG（`/slides/:slug`・`/slides/:slug/og.png`）は、`paths` が一覧とフィードと同じ公開済みで MDX のあるスライドの一覧1つ（`features/slides/application/slides.ts` の `getSlides`）から作る。デッキを足すのは apps/main の `content/slides/<slug>/content.mdx` とマイグレーションだけで、公開していないデッキは 404 になる
- `paths` は `vite.config.ts` の側で走る。設定のバンドルは `@repo/database` を外に出し、Node がそのまま読むと落ちるので、DB を読むモジュールは Vite の `runnerImport` で読む
- OG は route.ts の GET が satori と `@resvg/resvg-js` で PNG にする（`shared/og`）。フォントは `shared/og/fonts` に置いたものだけを使い、next/og と違ってビルドで足りない字形をネットから取らない。足りない字形があれば route.ts の GET が reject し、ビルドが止まる。字を足すときは `shared/og/fonts` にフォントを置く

## テストと Storybook

- Vitest の project は site・features・shared・components（部品の単体テスト）・dependencies と storybook
- Storybook は `@storybook/react-vite`（`pnpm -F main-k8ordo storybook`、port 6007）。Storybook と vitest の storybook の project は `.storybook/vite.config.ts` を読み、アプリの `vite.config.ts`（framework()・vercel()）は読まない
- features を読むサーバーの部品（`BlogLayout`・`BrowserSupportStatus`）は、描く部分（`BlogLayoutContent`・`BrowserSupportStatusLive`）を別の部品にし、story は描く部分を描く。features は `node:fs` などを読むので、Storybook のブラウザでは読めない
- テーマは toolbar か `parameters.theme` で決め、`ColorSchemeProvider` の `defaultPreference` に渡す。Story ごとに localStorage のテーマと `@k8ordo/state` の状態を消す
- Storybook には Navigation API を拾う router が無く、`@k8ordo/state` の url を書く `update()` はそのままでは iframe を読み込み直す。URL を読む・書く部品の story は、`.storybook/url-state-story.ts` の `interceptUrlNavigation` を `beforeEach` に渡す。Story の前に `parameters.query`（`q=css` のような query の文字列）と `parameters.hash` を URL に足し、同じ文書の `navigate` を `intercept()` で止め、Story のあとに Story の前の URL（pathname・search・hash）と `history.state` へ戻す。Navigation API の entry の state（`definePageState` の `entry`）は前後の `history.replaceState` で消えるので、Story は空の entry の state から始まり、Story のあとも戻らない
- Story は描いた時から React が欄を持つので、hydrate の前に欄へ打った文字を `q` へ写すことは、`.storybook/url-state-story.ts` の `hydrateAfterTyping`（サーバーで描いた HTML を置き、欄に打ってから hydrate する）で確かめる。この story は終わると canvas に何も残らないので `vrt.skip` にする
- VRT（`.github/workflows/vrt.yml`）は、apps/main に対応する story を apps/main のスクリーンショットと比べる。`app/_components` → `components/site`、`app/<area>/_components` → `components/<area>` に置き直すので、apps/main から写す story は、この置き場とファイル名・export 名を保つ。apps/main に無い story と、apps/main と違うことを許した story は、main-k8ordo の前回のスクリーンショットと比べる。許した story は vrt.yml の `OWN_BASELINE_KEYS` に並べる

## 環境変数

手元では `.env.example` を `.env.local` に写す。`GOOGLE_ANALYTICS_ID` があると、ルートレイアウトが GA の script と `ga-init.js`（apps/main の public）を読み、script に `data-count-navigations` を付けて、ページが替わった遷移ごとに page_view を送らせる。これは GA の管理画面で拡張計測の「ブラウザの履歴イベントに基づくページの変更」を切ってある前提で動く。k8ordo の router は push の遷移で pushState を呼ばないので拡張計測に拾われないが、戻る・進むは popstate で拾われ、設定を切らないと二重に数える。ビルドの描画でサーバーの部品が `process.env` を読むので、`vite.config.ts` が `.env.local` を `process.env` に読み込む。`.env` は git から外れないので使わない。ビルドは DB を読むので、`K8O_TURSO_*` が要る。

## 型

`.k8ordo/` の route の表と型は `vite build`・`vite dev`・`k8ordo generate` が書く（git に入れない）。`k8ordo generate` は DB も `paths` も読まずに書くだけなので、CI は check と type-check の前にこれを流す（static の断りは見ないので、それはビルドで分かる）。`.k8ordo/` は git から外れていて turbo の既定の inputs に入らないので、type-check の `inputs` に足している。

llms.txt が Playground のセクションを読むので、type-check はデモの TSX も通る。デモの CSS Modules の型は apps/main の `__generated__`（apps/main の `next typegen` が書く）を `tsconfig.json` の `rootDirs` で読む。main-k8ordo の type-check は、`turbo.json` の `dependsOn` で main の type-check（`next typegen`）を待つ。ルートの `turbo.json` は type-check の `outputs` に `__generated__` を入れているので、main の type-check がキャッシュに当たっても型が戻る。React と DOM の型の補い（`src/react.d.ts`・`src/dom.d.ts`）は apps/main と同じものを置く。
