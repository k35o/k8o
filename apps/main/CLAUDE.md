# apps/main CLAUDE.md

k8o.me のアプリ。ブログ(MDX)、トークとそのスライド、Lab の小さな実験を、k8ordo（`@k8ordo/framework` の `mode: 'static'`）で静的に書き出す。Vercel には `.github/workflows/vercel-prebuilt.yml` が GitHub Actions でビルドした成果物を出す。k8ordo の使い方は `node_modules/@k8ordo/framework/docs/` を読む。

## 置き場（src/）

- **routes/** - route ファイル（`page.tsx`・`layout.tsx`・`not-found.tsx`・`error.tsx`・`route.ts`・`paths.ts` など）だけを置く。ほかのファイルはビルドが拒むので、テストも置けない（route.ts の試験は `site/` に置く）。route ファイルは薄くし、`components/<area>` の部品と `features/*/interface` を読む。route.ts はどれも `Content-Type` を Response に書く（Vercel ではこの型で配られる）
- **components/<area>/** - 部品と、その CSS Modules。layout やページの CSS もここに置く。`<area>` は URL の区画の名前で、サイト全体で使うものは `site`。OG の絵（`site/og-image`）もここに置く。画像は素の img に width と height を書いて描く。リポジトリに置く画像は `pnpm run -F main optimize:image`（使い方は `scripts/optimize-image.ts` の頭）で AVIF と srcset の版にして、版ごとコミットし、静的 import の値の `src` を渡す。記事の外で版を使う画像（`components/site/home`・`components/site/not-found`）は、版を import して srcset と sizes を書く
- **features/<feature>/** - 機能ごとの UI 以外の処理。`interface` は route と部品が読む関数、`application` は整形。DB の値は自分で読まず、api の `@repo/api/build-data` の関数を同じプロセスで呼んで読む（k8o の DB を読むコードは api にだけ置く）。多くのページが読む一覧（記事・タグ・トーク・デッキなど）の読み取りは `shared/cache/memoize-in-build.ts` で覚える（理由はその注釈）
- **site/** - `vercel()` の規則（`vercel-routes.ts`）・slug の正規表現・セキュリティヘッダー・ブラウザのターゲット。`vite.config.ts` が読むので、ここの import は拡張子まで書く
- **shared/** - アプリの中で横断して使う UI 以外の処理（api のクライアント、OG の PNG、llms.txt の中身など）。ブラウザからの書き込み（閲覧数・お問い合わせ・フィードバック・Push 購読・エラーのレポート）は、部品が `shared/api/public-api.ts` の hc で api の公開ルート（`apps/api/CLAUDE.md`）を呼ぶ
- **styles/** - `globals.css`
- **mocks/** - Storybook の MSW の既定のハンドラ。api の書き込みは 204、GET は 503 を返し、story が `msw.use` で決めない限り本番の api に出ない
- **content/** - ブログ記事と、MDX で書いたトークのデッキの中身。`content/blog/<slug>/` に `article.mdx` と、その記事だけが使う `_images/`・`_components/`・`article.module.css` を置く。デッキの本文は `content/talks/<slug>/content.mdx`（作り方は `components/talks/README.md`）
  - MDX は `@/` を import しない（記事は `features/blog/application/article-files.test.ts`、デッキは `features/talks/application/deck-files.test.ts` が確かめる）。相対の import（`./_images`・`./_components`・`./article.module.css`）と、パッケージの import は使ってよい。`content/` の TS・TSX も同じものを import しない（ルートの `vite.config.ts` の lint が止める）
  - 記事の画像は AVIF にして `_images/` に置き、`Image`・`FloatImage` に width と height を書く。width と height が画像の縦横比と合うことは `article-files.test.ts` が確かめる。`Image`・`FloatImage` は、`_images/` の版（`<名前>.<幅>w.avif`）を glob で拾い、width より狭い版と元の画像（width の幅として）を srcset に挙げるので、記事の MDX には版を書かない
  - 記事の `LinkCard` が描く OGP は `content/link-card-metadata.json` にコミットする。`pnpm run -F main generate:link-card-metadata` が記事の LinkCard の URL を集め、JSON に無い URL と、値が `{}`（OGP が取れなかった）の URL を取って書く（`--refresh` で全件を取り直す）。記事に LinkCard を足したら流す（抜けは `article-files.test.ts` が落とす）
- **scripts/**（パッケージの直下）- `pnpm run -F main <名前>` で流す道具。`generate:browser-min-versions`・`generate:link-card-metadata`・`optimize:image`・`upload:talk-deck`

記事のページは記事の MDX を alias の `@content`（`src/content`）から import し、markdown・frontmatter・目次のように MDX を文字列で読むところは `shared/site/content-dir.ts` の根から読む。

## 殻とページの head

- ルートレイアウトが `<html>`・`<head>`・`<body>` を書き、`<head>` にはどのページにも出す meta と link（manifest・icon・referrer など）を置く。`<title>` は書かない
- 配色の script（`ColorSchemeScript`）は `<head>` に、切り替えを受け持つ `ColorSchemeProvider` は `<body>` に置く。`defaultPreference` を渡すなら、`COLOR_SCHEME_SCRIPT_OPTIONS` に足し、`ColorSchemeProvider` にも同じ値を渡す
- ブラウザの UI の色（`<meta name="theme-color">`）は、`ColorSchemeScript` が `THEME_COLOR`（`src/shared/site/theme-color.ts`。ページの背景の `bg-surface` のトークンの値）から書く。テーマを選んでいなければ OS の設定に、手で選べばそのテーマに合わせる。ページの側で theme-color の `<meta>` を書くと、script が書いたものより後ろになって使われない
- フォントの preload は、ルートの layout が M PLUS 2 の Latin の face の 1 本だけを react-dom の `preload` で書く（理由は layout.tsx の注釈）
- ページの title・description・canonical・og・twitter・RSS の alternate は、ページが `components/site/page-meta` の `PageMeta` を描いて書く（React が head へ上げる）。親の値は継がれないので、OG の画像などは各ページが渡す
- エラーの画面（`components/site/error-fallback`・`components/site/root-error-boundary`）はページの PageMeta に替わって出るので、`<title>` を直に描く
- ルートレイアウトの部品（GlobalLayout・Provider など）の失敗は `routes/error.tsx` の外で起きるので、`components/site/root-error-boundary` が受けて api に送る
- page・not-found・route.ts はリクエストが届いたときに読まれ、それが静的に読むクライアントの部品と CSS（サーバーの部品の CSS Modules を含む）は、そのページだけが読む。layout・error が静的に読むものは、どのページも読む（区画の layout のものも、トップと 404 が読む）。殻にはどのページにも要るものだけを置く。区画の見出しと説明と幅のように、その区画のページだけが要る枠も layout.tsx に置かず、部品（`components/tags/tags-frame`・`components/talks/deck-frame`）にしてページが描く
- クライアントの部品が静的に読むモジュールを、ほかのページか殻のクライアントの部品も読むと、そのモジュールはページのチャンクに入らず、分け合うファイルに入る。@k8ordo/ui のアイコン（`@k8ordo/ui/icons`）は 1 つずつ別のモジュールで、ロゴ類は `components/site/brand-icons` に 1 つずつ置く
- page・not-found が import する CSS と副作用は、そのページを読んでから効き、読んだあとはそのタブ（ビルドと dev ではそのプロセス）に残ってほかのページにも効く。ほかのページも当てにするもの（`globals.css`・フォント・`@/i18n`）はルートの layout で import する。そのページだけが使う CSS（mdx-base が読む数式とコードハイライトの CSS）はページの側に置く。置けるのは、ほかのページの見た目を変えないものに限る（数式とコードハイライトの CSS が見た目を決めるのは、`math` の要素と、`.math-scroll`・`.shiki`・`.code-annotate-*` などのクラスの要素だけ）
- head の CSS の並びは k8ordo の docs の routing.md の「How a page is sent」のとおり（サーバーの部品の CSS が前、クライアントの部品の CSS が後）。framework が並びのために head に書く中身の無い `<style>` を、CSP は `style-src` の `'unsafe-inline'` で通す。src の CSS Modules は、記事のものも含めて `@layer components` に入り（`better-css-modules.config.ts`）、@k8ordo/ui の部品の CSS と同じ層なので、同じ詳細度の規則の勝ち負けはその並びで決まる。同じ要素に別のモジュールの class を重ねるとき（`TableOfContentsSideRail` のように外から class を受ける部品）は、両方で同じプロパティを書かない
- router は、同じ route の別の値へ移るとき（`/blog/a` から `/blog/b` など）、ページの木を作り直さずに次の値の props で描き直す。値ごとに部品の状態を初めに戻すため、動的なページは描く部分の根の要素に値で key を付ける（記事は `BlogLayoutContent` の `ArticleFrame`、タグは `TagContent`、デッキは `SlideArticle`・`PdfDeckArticle`）
- router は、layout の外へ移ると、その layout から下の部品を DOM ごと捨てる。ページを移っても保つ状態（縦書きの切り替え）の Provider は、使うページの layout ではなくルートの layout に置く。ルートに置いて保てるのは React の状態だけで、DOM の状態（縦書きの本文の横のスクロールなど）は戻らない。殻にはどのページにも要るものだけを置く、という決まりの例外
- サイトの行き先（Blog・Talks・Artifacts・Readings と、押すとパネルが開く Lab）は `components/site/global-layout/site-destinations.tsx` に置き、48rem 以上ではヘッダーのナビ（`header-nav`）が、それより狭い幅では画面の下に固定するドック（`dock`）が描く。どちらも HTML にあり、幅で片方を `display: none` にする。今いる区画に `aria-current` を付ける（入口のページは `page`、その下のページは `true`）。Lab のパネルの中身は `lab-links` で、行き先を選ぶとパネルを閉じる
- ドックは下へのスクロールで画面の外へ引っ込み、上へのスクロールで戻る（ヘッダーと同じ `useIsScrollingDown`）。キーボードでフォーカスが中に入ったときと、Lab を開いているあいだは引っ込まない。ドックがフッターとフォーカスした要素を覆わないよう、`globals.css` の `--spacing-dock-clearance` を `GlobalLayout` の下の余白と `scroll-padding-bottom` に取る。値が付くのは下に固定されるものがある幅とページだけで、48rem より狭い幅と、ページが項目を足している 80rem より狭い幅（`:has()` で置き場の中身を見る）。それ以外は 0
- ページが自分の項目をドックに足すときは、`dock-slot.ts` の `useDockSlot` が返す置き場へ `createPortal` で `DockMenu` を描く。記事のもくじ（`components/blog/blog-layout/table-of-contents`）がそうしていて、80rem より狭い幅でだけ出す（広い幅では本文の横のもくじが出る）。足した項目があるあいだ、ドックは引っ込まず、その項目だけを同じ位置の帯として残す（字は `pinnedLabel`。もくじはいま読んでいる見出し）。48rem 以上ではドックの行き先を描かないので、足した項目はいつも右下の帯になる。置き場は HTML には無く、項目は hydrate のあとに出る
- ヘッダーのお問い合わせ（`components/site/contact-to-me`）は、`HeaderActions` が Suspense で包まずに描くので、HTML のヘッダーにボタンと閉じた dialog が出る。JS なしでもボタンは出て、押しても dialog は開かない（テーマのボタンと同じ）
- お問い合わせのフォームは `@k8ordo/form` に載せる。schema（`contact-to-me/contact-fields.ts`。api の `/public/inquiries` と同じ長さの決まり）から `formFields` で導いた fields を、サーバーの部品の `HeaderActions` が props で渡し、`ContactToMe` が `useForm` で属性とエラーを出す（zod はクライアントに渡らない）。static mode には Server Action が無いので、送信は `useActionState` の関数がブラウザから api を呼び、送れなかったときは本文を `values` で、失敗の文言を `errors` で返す

## 記事の MDX

- MDX は `vite.config.ts` の `@mdx-js/rollup`（`enforce: 'pre'`）が JSX にする。remark・rehype は `@repo/mdx-preset` の preset
- 記事のページ（`routes/blog/[slug]/page.tsx`）は、`components/blog/blog-article` が `import.meta.glob` で集めた MDX を slug ごとに遅れて読み、`components/site/mdx-base` の `MdxContent` で描く。`MdxContent` は mdx-base の部品（見出し・コードブロックなど）に、渡された部品（記事は `components/blog/blog-mdx-components` の `blogMdxComponents(slug)`。BrowserSupportStatus・LinkCard・Image・FloatImage・Alert と、動く例の code-demo）を重ねる
- plugin-rsc が import した CSS を載せる包みを付けるのは、CSS を静的に import する `.tsx` などのモジュールが export する、大文字で始まる関数の部品だけ。包んだ部品が、自分の import の木（build ではそれが入るチャンク）の CSS を載せる。だから、MDX を描く部品と、それが読む CSS（mdx-base の CSS Modules、コードハイライトの `@repo/code-highlight/styles.css`、数式の `@repo/mdx-preset/math.css`）は mdx-base に置く。部品の表だけを export して呼ぶ側で描くと、dev のページにその CSS が載らない
- `.mdx` が import した CSS（記事の CSS Modules）は、framework がそのファイルを描くページに載せる。glob にクエリは要らない
- ページの切り替えでは、移る先が `<ViewTransition>`（コードのタブ）を含んでいても、文書の view transition は始まらない。始まるのは、ページの中でタブを切り替えたとき

## 記事の動く例

- コードブロックのメタの `demo="<名前>"`（`@repo/code-highlight/demo`）が、隣り合う同じ名前の html・css・js・tsx のブロックを1つの例にする。記事では `@repo/code-highlight` がブロックを `code-demo` の要素で包み、`blogMdxComponents(slug)` が `components/blog/code-demo` の部品で描く。例の文書は `routes/blog/[slug]/demos/[demo]/document.txt/route.ts` が、記事の MDX の同じブロックから `features/blog/application/demos.ts` で読んで組み立てるので、見せるコードと動くコードは1つの書き方から出る
- 例の URL は、`routes/blog/[slug]/demos/[demo]/paths.ts` が記事ごとに例の名前から作る。例を使う記事が1本も無いと、値の無い route としてビルドが止まる。名前の書き誤りと離れたブロックは `readDemos` が投げ、`article-files.test.ts` が落とす
- 記事は、結果の欄が画面に近づくと例の URL を fetch し、文書を `sandbox="allow-scripts allow-forms"` の iframe の `srcdoc` に入れる（`code-demo-view.tsx`）。例は origin を持たず、記事の DOM・localStorage・cookie に触れない。`allow-forms` は `<form method="dialog">` と submit のイベントのためで（Chrome と Firefox は無いと動かさない）、送信は例の文書の `form-action 'none'` が止める。sandbox の値は story（`code-demo-view.stories.tsx`）が固定する。iframe に URL を読ませないのは、allow-same-origin の無い sandbox の iframe のリクエストを止める閲覧環境（Claude Desktop のブラウザの欄）でも描くため。例は記事の JS が動いてから出て、JS が無いと出ない。やり直すときは iframe を作り直し、読んだ文書を入れ直す
- 例の URL（`/blog/:slug/demos/:demo/document.txt`）は文書を `text/plain` で返す。HTML として配ると、URL を直に開いたときに sandbox の外（サイトの origin）で動くので、拡張子でも応答の型でも HTML にならない形にする。srcdoc の文書は応答の頭を通らないので、例の文書は頭の初めに制限の `<meta>`（`site/security-headers.ts` の `DEMO_META_CONTENT_SECURITY_POLICY`）を持つ
- 例が読めるのは、サイトの画像・音源・フォントだけ（`img-src`・`media-src`・`font-src` にサイトの origin。`connect-src` は閉じたまま）。例の文書は origin を持たず `'self'` は Firefox で当たらないので、文書は origin の置き場（`shared/demo/demo-origin.ts`）で書き出し、記事が srcdoc に入れるときに自分の origin に置き換える。例だけが使う画像と音源は `public/demos/<slug>/` に置き、例のコードには `/demos/<slug>/<名前>` と書く（srcdoc の相対の URL は記事の URL から解かれる）。`/demos/` の応答には `Access-Control-Allow-Origin: *` を付ける（`site/demo-assets.ts`。Vercel は `vercel-routes.ts` の規則、dev と preview は `vite.config.ts` の plugin）。例から見るとサイトのファイルは別の origin で、canvas に描いて読み出す例は `<img crossorigin="anonymous">` で読む。フォントはいつも CORS で読まれるので、例の `@font-face` が読めるのも `/demos/` のファイルだけ
- ブラウザの権限は、コードブロックのメタの `allow` に書いた例にだけ渡す（`demo="copy" allow="clipboard-read clipboard-write"`。どのブロックに書いてもよい）。書けるのは `clipboard-read`・`clipboard-write`・`screen-wake-lock` で、ほかは `parseDemoAllow` が投げる。記事の側の iframe の `allow` 属性になり（`shared/demo/demo-allow.ts`）、例のコードからは増やせない。ブラウザの許可はサイトに対して残るので、どの例にも渡すことはしない
- 例のコードは `innerHTML` を使わず、`textContent` と `createElement` で組む。`location` の query と hash は読まない
- srcdoc の文書は記事の CSP（頭と `<meta>`）も引き継ぐ。記事の `<meta>` は inline の script をハッシュでだけ許すので、ビルドのときに `vite.config.ts` が全記事の例の文書を route.ts と同じ `buildDemoDocument` で組み立て、その inline の script のハッシュ（`site/inline-script-hashes.ts`）を `pagePolicy` で `<meta>` に足す。router はページを読み直さずに移り、最初に読んだページの `<meta>` が残るので、例の無いページにも同じハッシュを書く。dev の HTML は `<meta>` の CSP を持たないので、ハッシュの抜けは dev では分からず、本番ビルドで確かめる
- srcdoc は Trusted Types の受け口なので、記事は文書を `shared/demo/demo-trusted-html.ts` の `k8o-demo` の policy で TrustedHTML にして渡す
- tsx の例は、`vite.config.ts` の `blogDemoScripts`（`site/blog-demo-scripts.ts`）が、export default の部品を描く入口と本番版の React ごと 1 本の JS に束ね、`virtual:blog-demo-scripts` にする。例の iframe は origin を持たず、サイトの共有のファイルを module で読めないので、React も例ごとに文書の中に入れる。束ねた結果は `demoBundler` が tsx の中身ごとに覚え、ハッシュと route.ts の JS に同じ結果を使い、dev では記事を保存すると束ね直す。import は `react` と `react-dom` だけを許す。route は tsx の例を描くときにだけ `features/blog/application/demo-scripts.ts` を読む（テストと Storybook はこのプラグインを持たない）
- 例の文書は、記事と postMessage で配色と高さをやりとりする（形は `shared/demo/demo-message.ts`、例の側の script は `demo-document.ts`）。Safari は iframe の `prefers-color-scheme` を記事の `color-scheme` に合わせないので、記事が手で選んだ配色を送る

## 一覧（`/blog`）

- 検索の `q` は一覧の `definePageState` の url に置き、打つたびに `update()`（既定の replace）で書く。入力は `q` をそのまま出し、絞り込みと群（年）の組み立てだけを `useDeferredValue` で遅らせる
- static mode では HTML は既定値（全件）で、`?q=` は hydrate のあとに効く。hydrate の前に欄へ打った文字は、欄が付いた時に `q` へ写す（`shared/browser/replay-typed-value.ts` を欄の `ref` に渡す）
- 一覧のカードのリンクは `href()` で組んだ素の `<a>` にする。`components/site/content-card` の `ContentCard` は、呼ぶ側が `href()` で組んだパスを `href` で受ける

## 日々の表示（`/reading-list`・`/browser-support`・`/notifications`）

- `/browser-support` と `/notifications` は、ページがビルドで api の関数から読み（`features/*/interface` の関数）、その値を props で渡す。クライアントの部品は `shared/api/live-snapshot` の `useLiveSnapshot` で api の公開の GET を読み、読めたら差し替える。hydrate はビルドの値で描き、HTML とずらさない。「直近1週間」の基準の時刻（`nowMs`）もビルドの値に入れて渡す
- `/reading-list` は直近 90 日の記事をすべて描くので、ビルドの値を HTML とペイロードに埋めず（埋めると数百件を HTML と api で 2 回送る）、ブラウザで `GET /public/reading-list` を読む（`components/reading-list/reading-list-source`）。届くまでは `BrowserOnly` の骨組みのまま待ち、読めなければ読み直しを案内する（`ReadingListLoader`）。一度読んだ一覧の覚え方と、読めなかったときの読み直しは `reading-list-source` の注釈のとおり
- `/reading-list` は、api が日ごとに組み立てたまとめ（`days`）を描く（`components/reading-list/reading-digest-list`）。1 日は、全体像の文・特に見てほしい記事（畳まない）・残りの話題（押すとその話題の記事が開く）の順に並ぶ。検索（題とソースの名前に当てる）しているあいだは、当たった記事を公開日を添えて新しい順に 1 列で並べる（`components/reading-list/reading-search-results`。数百件になりうるので、先頭から少しずつ描き足す）。検索の `q` は `/blog` の一覧と同じく一覧の `definePageState` の url に置き、検索欄も同じ `components/site/searchable-list` を使う。ページの背景の飾りに文字を直に載せないよう、1 日ごとと検索の結果に薄い下地を敷く
- HTML を読むうちに api を取り始める `preload`（`as: 'fetch'`）は、client の部品の `ReadingListPreload` が描くときに書く。Server Component で書くとペイロードの hint にも入り、Readings へのリンクを先読みしただけで api を読む
- `/browser-support` の絞り込みは区画の `search-params` の `definePageState` の url に置き、入力ごと・クリックごとに `update()`（既定の replace）で書く。値は文字列のまま持ち、読むときに解く。`z.stringbool` は `?widely=1` も真に読むので、真偽はアプリが書く `true` だけを真にする
- 一覧は `BrowserOnly` でブラウザでだけ描き、骨組み（`ReadingListSkeleton`・`BrowserSupportFeatureListSkeleton`）を `fallback` に渡す。骨組みは HTML の client-rendered の境界（`<!--$!-->`）の中に出る。骨組みを `loading.tsx` として route に置かないのは、static mode では HTML にも遷移にもほぼ出ず、layout と同じくその CSS をどのページも読むから
- ブラウザ最低版のフロア（`features/browser-support/infrastructure/browser-min-versions.json`）は、ルートレイアウトが読み、ビルドのターゲット（`site/browser-targets.ts`）も作る、コミットした生成物。`pnpm run -F main generate:browser-min-versions [version]` で作り直す。同じ版からリポジトリ直下の `.browserslistrc`（ai の Next.js の Lightning CSS / SWC のターゲット）も書くので、どちらも手で編集しない。api の active データセットとずれると、外形監視（`.github/workflows/browser-support-monitor.yml`）が k8o-bot 名義で作り直しの PR を作り、自動マージする
- 対応外のブラウザへの警告は、UA と版ではなく機能検出（`features/browser-support/application/baseline-support.ts` の `BASELINE_PROBES`）で出す。対象はこれまでに Baseline に入った全機能で、年では区切らない。検出するのは、生成物の `floorFeatures`（各ブラウザの最低版を決めた機能）からブラウザごとに 1 つ以上を覆う最小の組。最低版が上がって覆えなくなると `baseline-support.test.ts` が作り直しの PR を落とすので、候補からページで検出できる機能を選んで差し替える
- 購読の VAPID の公開鍵は、`routes/notifications/page.tsx` がビルドの描画で `process.env` から読み、props で渡す。`import.meta.env` でクライアントへ渡すと、名前を `VITE_` に替えることになる

## トークのデッキ

- デッキは `talks` の行の持ち物で、route は `/talks/:slug` の 1 本（何を書くかは「ビルドが読むもの」）。題・イベント・日付は行から出す。`features/talks/application/talks.ts` の `getTalks` が、トークにデッキの種類（`deck`）・一覧に出す表紙（`cover`。PDF のデッキの 1 ページ目）・スライドのリンク先（`slidesHref`。デッキがあれば `/talks/<slug>`、無ければ null）を足し、`/talks` のカード・記事の「スライドを見る」・llms.txt がそれを読む
- MDX のデッキは `components/talks/slide-article` が記事と同じく `import.meta.glob`で slug ごとに遅れて読み、`MdxContent` にスライドの部品の表を重ねて描く。MDX の `<SlideDeckShell slug>` は QR の URL と同期の名前になるので、ディレクトリ名と同じにする（`features/talks/application/deck-files.test.ts` が確かめる）
- PDF から作ったデッキは、`components/talks/pdf-deck-article` が `public/talks/<slug>/deck.json`（`features/talks/application/pdf-deck.ts` のマニフェスト）を読み、ページの画像を `SlideDeck` の 1 枚ずつにして同じ枠で描く。`bleed` を受けた `SlideDeck` は、Stage を全面にし、印刷用の描画と PDF 出力のボタンを置かない。元の PDF はストアにだけ置き、ビルドは取り込まない。全ページの img をサーバーで描いて渡すので、React が head に全ページの画像の preload を書き、開いた時にすべて読む（`pdf-page` の注釈）
- 発表者モードかどうか（`mode`）と、観覧と発表者の生存の知らせの名前（`session`）は `definePageState('slide-deck')` の url に、表示する枚の `#<番号>`（1 始まり）は同じ state の hash に置く。hash は文字列のまま持ち、`slideIndexOf` が読むときに解く（番号でない fragment と `#0` は 1 枚目）。番号でない fragment への移動は `slide-deck/fragment-target.ts` の `keepFragmentInDeck` が止める
- static mode の HTML は url の state を既定値で描くので、デッキ全体を `BrowserOnly`（`use(browser())` を Suspense で包む）でブラウザでだけ描く。HTML の `<main>` は見出しの Talks と、空の digest の `<!--$!-->` が 1 つになる
- router は移る先の URL を先に書き、着くまで前のページを画面に残す。そのあいだ state は開いたときの URL の値を返し、`update()` は何も書かない。state を通らないほかのタブへの知らせ（BroadcastChannel）は、開いたときの pathname を覚えて止める（`useDeckController` の注釈）
- `SlideDeckShell` は MDX の子を `hr` で区切り、`Notes` を関数に付けた `$$slideRole` で見分けて、クライアントの `SlideDeck` に渡す。`Notes` は関数の宣言や式で export しない。CSS を import するモジュールでそう書くと、plugin-rsc が CSS を載せる包みの関数に替え、`$$slideRole` が外れてノートが本文に出る

## vercel() の規則と dev

- 末尾スラッシュの 308・Accept での出し分け・`/reading-list/feed` の中継とそのヘッダーは、`src/site/vercel-routes.ts` を `vercel()` に渡して `.vercel/output/config.json` に書く。当たるのは Vercel だけで、`vite dev`・`vite preview` には当たらない
- Vercel は `src` をパスの全体に当てる（頭だけの `^/blog/` はどれにも当たらない）。どの `src` も `^` から `$` まで書く（`vercel-routes.test.ts` が確かめる）
- 全応答のヘッダーは `framework()` の `headers` に渡す（「セキュリティヘッダー」）。`/reading-list/feed` は、dev では `server.proxy` で中継する

## ビルドが読むもの

- ビルドが DB を読んで書き出すので、talks / tags / blogs と記事の公開・非公開（マイグレーションでだけ変わる）が画面に出るのは、main のデプロイのとき。本番の workflow は、マイグレーションを流してから main をビルドして出す
- 記事のページと記事の下の URL（`/blog/:slug`・`/blog/:slug/article.md`・`/blog/:slug/og.png`）は、`routes/blog/[slug]/paths.ts` が、フィードと llms.txt と同じ公開済みの記事の一覧1つ（`features/blog/interface/queries.ts` の `getBlogContents`）から作る。下書きと MDX の無い記事は挙がらず、404 になる。列挙した記事の route.ts が 200 を返さなければビルドが止まる
- タグのページ（`/tags/:id`）は、`routes/tags/[id]/paths.ts` が DB の全タグの id（`@repo/api/build-data` の `getTags`）から作る。中身が 0 件のタグ（下書きか MDX の無い記事だけのタグ）のページも書き、noindex にして sitemap と `/tags` の一覧から外す。この 3 つは、タグの中身を `shared/site/tag-contents.ts` で、MDX のある公開済みの記事（`getBlogContents`）とトークから数える。id は route の `paramsSchema` で正の整数に読むので、ページも `href('/tags/:id', { id })` も数値を受ける。挙げていない id と数字でない値は、ビルドでも `vite dev` でも 404 になる
- デッキのページと OG（`/talks/:slug`・`/talks/:slug/og.png`）は、`routes/talks/[slug]/paths.ts` が一覧と sitemap と同じ、`slug` を持ち中身（MDX か PDF のマニフェスト）のあるトークの一覧1つ（`features/talks/interface/queries.ts` の `getTalkDecks`）から作る。`slug` の無いトークと中身の無いトークのデッキは 404 になる（手順は `components/talks/README.md`）
- PDF から作ったデッキの中身はコミットせず、`upload:talk-deck` が Vercel Blob の非公開ストアに置く。`vite.config.ts` の `k8o:pdf-deck-sync` が、ビルドと dev の初めに、`slug` を持ち MDX の無いトークの中身を `site/pdf-deck-sync.ts` でストアから `public/talks/<slug>/`（git は見ない）へ取り込み、挙がっていない slug のディレクトリを消す。取り込むのは `BLOB_READ_WRITE_TOKEN` のあるビルドと dev で、本番のビルドは、トークンが無いかストアに中身が無い PDF のデッキがあると止まる。トークンの無い preview と手元は、手元に無いデッキだけを k8o.me に公開されているファイルから写す（`publicSiteStore`）。`/talks/:slug` は値が 1 つも無いとビルドが止まるので、ストアを読めないビルドにも公開済みのデッキを持たせている。手元の `upload:talk-deck` が書いたデッキは置き換えない。まだ公開されていないデッキは写せず、そのトークはデッキもスライドへのリンクも出さない。`deck_published_at` が先の時刻のトークは、api が `slug` を返さないので、ビルドは取り込まずページも作らない。時刻を過ぎたあとは、`vercel-prebuilt.yml` の定期実行（`due-decks`）が本番の main を建て直して出す
- ホームの Activity は、記事・登壇と、Artifacts の npm のパッケージのリリースを新しい順に混ぜる（`features/activity/interface/queries.ts` の `getActivity`）。リリースはビルドが npm のレジストリから読み、同じパッケージの同じ月（日本時間）の版を 1 行にまとめる。読めなかったパッケージは警告を出してリリースを出さず、ビルドは止めない。新しいリリースと、登壇前のトークの「予定」が画面で変わるのは、main のデプロイのとき
- `/artifacts` は `components/artifacts/artifacts/artifacts.ts` の一覧を、まとまり（`ARTIFACT_GROUPS`）ごとの棚に並べる。各項目の最後の版と公開日は、ビルドが npm のレジストリから読む（`getLatestReleases`。プレリリースは数えない）。レジストリの読み取りはビルドの中で覚え、ホームの Activity と分け合う。`@k8ordo/*` は同じ版でそろって出るので、k8ordo は `@k8ordo/ui` の版で代表する。読めなかったパッケージは警告を出して版を出さず、ビルドは止めない。デザインシステムに無いアイコンは `components/artifacts/artifact-icons` に、同じ升目と線の太さで描く
- `/sitemap.xml` は `routes/sitemap.xml/route.ts` が `shared/site/sitemap.ts` で書く（並び・lastmod・changefreq と XML の形は `sitemap.test.ts`）。lastmod は記事の更新日とトークの登壇の日から決め、ビルドの時刻は使わない。route.ts があるので、framework は `sitemap.xml` を書かない
- `paths.ts` はページと同じバンドルで走るので、alias と `@repo/*` をそのまま import でき、覚えた一覧（`memoizeInBuild`）をページと分け合う
- OG は route.ts の GET が satori と `@resvg/resvg-js` で PNG にする（`shared/og`）。絵（`components/site/og-image`）は 1 つの形で、左に題とアイコンを置き、記事の `[!og]` の印を付けたコードがあれば右にそのパネルを置く。パネルの無い OG（トーク・一覧・コードの無い記事など）は、題を横いっぱいに大きく描く。区画の名前（Blog・Talks）は描かない。フォントは `shared/og/fonts` に置いたものだけを使い、ビルドで足りない字形をネットから取らない。足りない字形があれば route.ts の GET が reject し、ビルドが止まる。字を足すときは `shared/og/fonts` にフォントを置く

## セキュリティヘッダー

`src/site/security-headers.ts` の CSP・`Content-Security-Policy-Report-Only`・Reporting-Endpoints・`Cross-Origin-Opener-Policy` などを、`vite.config.ts` が `framework()` の `headers` に渡して全応答に付ける。`vite dev` は dev の値、ビルドと `vite preview` は `DEPLOY_TARGET` の値を送り、Vercel では `vercel()` がどの規則よりも前のルートとして書く。どちらの CSP の違反も `csp-endpoint`（api の `/public/reports`）に届き、api の MCP の `list_reports`（type は `csp-violation`）で読める。

- 頭の CSP の `script-src` は `'unsafe-inline'` のまま置き、inline の script は、`framework()` の `csp` が各ページの `<head>` に書くハッシュだけの `<meta>` の CSP（`pagePolicy`）で縛る（`security-headers.ts` の注釈）。script は頭と `<meta>` の両方が許すときだけ動く。テーマの script は渡した値を中身に持つので、ルートの layout の `ColorSchemeScript` と `vite.config.ts` の `colorSchemeScriptHash()` には同じ `COLOR_SCHEME_SCRIPT_OPTIONS`（`src/shared/site/color-scheme-script.ts`）を渡す。`<meta>` の CSP の違反はレポートに届かない
- Vercel の Toolbar のための `https://vercel.live` は、preview のビルドの CSP（頭の `script-src`・`frame-src` と `<meta>` の `script-src`）にだけ入る。preview かどうかは、`.github/workflows/vercel-prebuilt.yml` の deploy の job が付ける `DEPLOY_TARGET`（push は production、ほかは preview）で決まる。`DEPLOY_TARGET` の無いビルドは production の形になる
- `Cross-Origin-Opener-Policy: same-origin` を付け、ほかのオリジンの窓と閲覧の文脈を分ける。サイトの中で窓を開くのはスライドの発表者モードの `window.open` だけで、開く先は同じオリジンのデッキ
- Trusted Types は Report-Only で観測している（`security-headers.ts` の注釈）。default ポリシーは作らない。作ると sink に渡した文字列がそこで変換され、違反として上がらなくなる。名前付きの policy は、記事の動く例の文書を srcdoc に入れる `k8o-demo` だけを作り、`trusted-types` にはこの名前だけを書く。違反のレポートは、`effectiveDirective` が `require-trusted-types-for` で、`sample` に sink 名と値の先頭が入る

## テストと Storybook

- Vitest の project は site・features・shared・components（部品の単体テスト）と storybook
- Storybook は `@storybook/react-vite`（`pnpm -F main storybook`、port 6006）。Storybook MCP は `main-storybook-mcp`（props の確かめ方はルートの CLAUDE.md の「UI共通」）。Storybook と vitest の storybook の project は `.storybook/vite.config.ts` を読み、アプリの `vite.config.ts`（framework()・vercel()）は読まない
- features を読むサーバーの部品（`BlogLayout`・`BrowserSupportStatus`）は、描く部分（`BlogLayoutContent`・`BrowserSupportStatusLive`）を別の部品にし、story は描く部分を描く。features は `node:fs` などを読むので、Storybook のブラウザでは読めない
- テーマは toolbar か `parameters.theme` で決め、`ColorSchemeProvider` の `defaultPreference` に渡す。Story ごとに localStorage のテーマと `@k8ordo/state` の状態を消す
- URL を読む・書く部品の story は、`.storybook/url-state-story.ts` の `mountStoryUrl` を `beforeEach` に渡し、`parameters.query`（`q=css` のような query の文字列）と `parameters.hash` で URL を決める（`@k8ordo/state/testing` の `mountPageUrl` が router の代わりをし、Story のあとに URL を戻す）。URL に入った値は、間引きを待つ `expectParamInUrl` で確かめる。`definePageState` の `entry` の state は、Story の前後で消える
- Storybook では url の state は URL に従う。移るあいだ画面に残るページの値（離れる前の URL の値）で描く部品の story は、部品を `@k8ordo/router` の `<Router>` の下に置き、解けない `React.lazy` の部品の route へ移って、そのあいだをつくる（デッキの移るあいだの story）
- Story は描いた時から React が欄を持つので、hydrate の前に欄へ打った文字を `q` へ写すことは、`.storybook/url-state-story.ts` の `hydrateAfterTyping`（サーバーで描いた HTML を置き、欄に打ってから hydrate する）で確かめる。この story は終わると canvas に何も残らないので `vrt.skip` にする
- VRT（`.github/workflows/vrt.yml`）は、story ごとのスクリーンショットを main の前回のスクリーンショットと比べる

## 環境変数

ビルドの描画でサーバーの部品が `process.env` を読む。ビルドは DB を読むので、`K8O_TURSO_*` が要る。

- 手元の値は、ルートの `fnox.toml` の main の profile に置く（ローカルの DB の URL とダミーのトークン）。`dev` の script は `fnox exec -P main --` で包んであり、手元でビルドするときも `fnox exec -P main -- pnpm -F main build` と包む。fnox の値は、シェルにある同じ名前の値より勝つ
- 本番と preview のビルドは、`vercel pull` した main のプロジェクトの値を読む。DB の接続情報の置き場所は `packages/database/CLAUDE.md`。`VAPID_PUBLIC_KEY` は Shared Environment Variables に置き、api と共有する
- `BLOB_READ_WRITE_TOKEN` は PDF から作ったデッキのストアのトークンで、`slug` を入れる前のデッキも読める。GitHub の production の Environment の secret にだけ置き、本番のビルドのステップに渡す。手元で `upload:talk-deck` を流すときは fnox の vercel の profile から渡す
- `GOOGLE_ANALYTICS_ID` があると、ルートレイアウトが GA の script と `public/ga-init.js` を読み、`ga-init.js` がページの替わった遷移ごとに page_view を送る。これは GA の管理画面で拡張計測の「ブラウザの履歴イベントに基づくページの変更」を切ってある前提で動く。k8ordo の router は push の遷移で pushState を呼ばないので拡張計測に拾われないが、戻る・進むは popstate で拾われ、設定を切らないと二重に数える
- `VAPID_PUBLIC_KEY` は /notifications の購読の公開鍵で、空のビルドは購読のボタンを出さずに「対応していません」を出す

## 型

`.k8ordo/` の route の表と型は `vite build`・`vite dev`・`k8ordo generate` が書く（git に入れない）。`k8ordo generate` は DB も `paths.ts` も読まずに書くだけなので、`typegen` の script で流す（static の断りは見ないので、それはビルドで分かる）。check と type-check は先に `typegen` を流す。

CSS Modules の型（記事のものを含む）は、`typegen` の `better-css-modules generate` が `__generated__` に書き、`tsconfig.json` の `rootDirs` で読む。型が無いと styles のクラスが `string | undefined` になり、type-aware の lint が誤って落とすので、check の前にも `typegen` を流す。React と DOM の型の補いは `src/react.d.ts`・`src/dom.d.ts` に置く。
