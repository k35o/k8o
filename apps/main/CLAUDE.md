# apps/main CLAUDE.md

k8o.me のアプリ。ブログ(MDX)、スライド、トーク、開発者向けツール群、Playground を、k8ordo（`@k8ordo/framework` の `mode: 'static'`）で静的に書き出す。Vercel には `.github/workflows/vercel-prebuilt.yml` が GitHub Actions でビルドした成果物を出す。k8ordo の使い方は `node_modules/@k8ordo/framework/docs/` を読む。

## 置き場（src/）

- **routes/** - route ファイル（`page.tsx`・`layout.tsx`・`not-found.tsx`・`error.tsx`・`route.ts` など）だけを置く。ほかのファイルはビルドが拒むので、テストも置けない（route.ts の試験は `site/` に置く）。route ファイルは薄くし、`components/<area>` の部品と `features/*/interface` を読む。route.ts はどれも `Content-Type` を Response に書く（Vercel ではこの型で配られる）
- **components/<area>/** - 部品と、その CSS Modules。layout やページの CSS もここに置く。`<area>` は URL の区画の名前で、サイト全体で使うものは `site`。OG の絵（`site/og-image`）もここに置く。画像は素の img に width と height を書いて描く。リポジトリに置く画像は `pnpm run -F main optimize:image <元の画像> <出力.avif> [--max-width <px>] [--widths <px>,<px>...]` で AVIF にしてコミットし、静的 import の値の `src` を渡す。optimize:image は、出力より狭い幅（既定は 640・960・1280px、`--widths` で変える）ごとに、srcset の版 `<名前>.<幅>w.avif` も隣に書く（元より 1 割以上小さくならない版は書かない）。版もコミットする。記事の外で版を使う画像（`components/site/home`・`components/site/not-found`）は、版を import して srcset と sizes を書く。入力と出力に同じ AVIF を渡すと、元を書き直さずに版だけを作る
- **features/<feature>/** - 機能ごとの UI 以外の処理。`interface` は route と部品が読む関数、`application` は整形、`infrastructure` は DB の読み取り。ビルドはページを HTML とペイロードで2回描くので、interface の読み取りは `shared/cache/memoize-in-build.ts` で覚える（`vite dev` では覚えない）
- **site/** - `vercel()` の規則（`vercel-routes.ts`）・slug の正規表現・`paths` の組み立て・ビルドの後の検査・セキュリティヘッダー・ブラウザのターゲット。`vite.config.ts` が読むので、ここの import は拡張子まで書く
- **shared/** - アプリの中で横断して使う UI 以外の処理（api のクライアント、OG の PNG、llms.txt の中身など）。ブラウザからの書き込み（閲覧数・お問い合わせ・フィードバック・Push 購読・エラーのレポート）は、部品が `shared/api/public-api.ts` の hc で api の公開ルート（`apps/api/CLAUDE.md`）を呼ぶ
- **styles/** - `globals.css`
- **mocks/** - Storybook の MSW の既定のハンドラ。api の書き込みは 204、GET は 503 を返し、story が `msw.use` で決めない限り本番の api に出ない
- **content/** - ブログ記事とスライドの中身。`content/blog/<slug>/` に `article.mdx` と、その記事だけが使う `_images/`・`_components/`・`article.module.css` を置く。スライドの本文は `content/slides/<slug>/content.mdx`（作り方は `components/slides/README.md`）
  - MDX は `@/`・`next`・`next/*`・`next-themes` を import しない（記事は `features/blog/application/article-files.test.ts`、スライドは `features/slides/application/slide-files.test.ts` が確かめる）。相対の import（`./_images`・`./_components`・`./article.module.css`）と、パッケージの import は使ってよい。`content/` の TS・TSX も同じものを import しない（ルートの `vite.config.ts` の lint が止める）
  - 記事の画像は AVIF にして `_images/` に置き、`Image`・`FloatImage` に width と height を書く。width と height が画像の縦横比と合うことは `article-files.test.ts` が確かめる。`Image`・`FloatImage` は、`_images/` の版（`<名前>.<幅>w.avif`）を glob で拾い、width より狭い版と元の画像（width の幅として）を srcset に挙げるので、記事の MDX には版を書かない
  - 記事の `LinkCard` が描く OGP は `content/link-card-metadata.json` にコミットする。`pnpm run -F main generate:link-card-metadata` が記事の LinkCard の URL を集め、JSON に無い URL と、値が `{}`（OGP が取れなかった）の URL を取って書く（`--refresh` で全件を取り直す）。記事に LinkCard を足したら流す（抜けは `article-files.test.ts` が落とす）
- **playgrounds/** - Playground のデモ（`playgrounds/<id>/`）と、セクションの一覧 `sections.ts`、id だけの一覧 `ids.ts`（セクションを足したら `ids.ts` にも足す。食い違いは `ids.test.ts` が落とす）、枠の `playground.tsx`
  - `next`・`next/**`・`next-themes`・`@/` を import しない（ルートの `vite.config.ts` の lint が止める）。リンクは素の `a`、テーマで変える色は CSS の `light-dark()` で書く。デモだけが使う画像は `public/playgrounds/` に置き、URL で読む。サイトの `public` に既にある画像（`/icon.png`）は写さずにその URL を読む
- **scripts/**（パッケージの直下）- `pnpm run -F main <名前>` で流す道具。`generate:browser-min-versions`・`generate:link-card-metadata`・`optimize:image` と、2 つのサイトの全 URL を比べる `compare:sites`、ページを開いて落ちないかを見る `smoke:pages`

記事のページは記事の MDX を alias の `@content`（`src/content`）から import し、markdown・frontmatter・目次のように MDX を文字列で読むところは `shared/site/content-dir.ts` の根から読む。デモは alias の `@playgrounds`（`src/playgrounds`）から読む。

## 殻とページの head

- ルートレイアウトが `<html>`・`<head>`・`<body>` を書き、`<head>` にはどのページにも出す meta と link（manifest・icon・referrer など）を置く。`<title>` は書かない
- 配色の script（`ColorSchemeScript`）は `<head>` に、切り替えを受け持つ `ColorSchemeProvider` は `<body>` に置く。`defaultPreference` を渡すなら、両方に同じ値を渡す
- フォントの preload は、ルートの layout が M PLUS 2 の Latin の face（`@fontsource-variable/m-plus-2/files/m-plus-2-latin-wght-normal.woff2`）の 1 本だけを `?url` で読み、react-dom の `preload` で書く。どのページも ASCII の字を描くが、日本語の字は unicode-range で 100 本余りの face に分かれ、ページごとに要る face が違うので preload しない。preload が無いと、フォントが HTTP キャッシュに無いとき（初めての訪問など）は CSS を読んでからフォントを取りに行くので、差し替えで layout-shift が出て、Chromium で下げて再読み込みすると着く位置が数 px ずれる
- ページの title・description・canonical・og・twitter・RSS の alternate は、ページが `components/site/page-meta` の `PageMeta` を描いて書く（React が head へ上げる）。親の値は継がれないので、OG の画像などは各ページが渡す
- エラーの画面（`components/site/error-fallback`・`components/site/root-error-boundary`）はページの PageMeta に替わって出るので、`<title>` を直に描く
- ルートレイアウトの部品（GlobalLayout・Provider など）の失敗は `routes/error.tsx` の外で起きるので、`components/site/root-error-boundary` が受けて api に送る
- page・not-found・route.ts はリクエストが届いたときに読まれ、それが静的に読むクライアントの部品と CSS（サーバーの部品の CSS Modules を含む）は、そのページだけが読む。layout・error が静的に読むものは、どのページも読む（`routes/blog/layout.tsx` のものもトップと 404 が読む）。殻にはどのページにも要るものだけを置く。区画の見出しと説明と幅のように、その区画のページだけが要る枠も layout.tsx に置かず、部品（`components/tags/tags-frame`・`components/slides/slides-frame`）にしてページが描く
- クライアントの部品が静的に読むモジュールを、ほかのページか殻のクライアントの部品も読むと、そのモジュールはページのチャンクに入らず、分け合うファイルに入る。@k8ordo/ui の lucide のアイコンはどれも 1 つのモジュールにあって殻も読むので、どのクライアントの部品が描いたアイコンも、どのページも読む `frame-*.js` に入る。ほかのクライアントの部品がまだ描いていないアイコン（`/talks` だけの `LocationIcon`）を区画のクライアントの部品で描くと、どのページも大きくなるので、区画のサーバーの部品で描いて props で渡す（`TalkCard`）。確かめは、ビルドの `frame-*.js` に入るアイコンが、変える前のビルドと同じであることで見る
- page・not-found が import する CSS と副作用は、そのページを読んでから効き、読んだあとはそのタブ（ビルドと dev ではそのプロセス）に残ってほかのページにも効く。ほかのページも当てにするもの（`globals.css`・フォント・`@/i18n`）はルートの layout で import する。そのページだけが使う CSS（記事の MDX が読む KaTeX の CSS、mdx-base が読むコードハイライトの CSS）はページの側に置く。置けるのは、ほかのページの見た目を変えないものに限る（KaTeX とコードハイライトの CSS が見た目を決めるのは、`.katex`・`.shiki`・`.code-annotate-*` などのクラスの要素だけ）
- head の CSS は、直に開いても遷移で着いても、サーバーの部品の CSS（先頭はルートの layout が import する `globals.css`）が前、クライアントの部品の CSS が後に並ぶ（k8ordo の docs の routing.md の「How a page is sent」）。この並びのために framework が中身の無い `<style>` を head に 1 つ書き、CSP は `style-src` の `'unsafe-inline'` でそれを通す。遷移や先読みで初めて読むクライアントの部品の CSS は head の末尾に、遷移で初めて読むサーバーの部品の CSS はサーバーの部品の CSS の後ろに足され、一度読んだ CSS はそのタブから外れない。クライアントの部品の CSS どうしの並びは保証されず、サーバーの部品の CSS どうしも、遷移で着いたページでは前のページで読んだファイルが前に残る。src の CSS Modules は、記事とデモのものも含めて `@layer components` に入り（`better-css-modules.config.ts`）、@k8ordo/ui の部品の CSS も同じ層にあるので、同じ詳細度の規則の勝ち負けは並びで決まる。サーバーの部品とクライアントの部品の CSS では、どの開き方でもクライアントの部品の規則が勝つ。層の順は、head の先頭の `globals.css` が読む `@k8ordo/ui/styles.css` が決める。同じ要素に別のモジュールの class を重ねるとき（`TableOfContentsSideRail` のように `cn(styles.root, className)` で外から class を受ける部品）は、両方で同じプロパティを書かない
- router は、同じ route の別の値へ移るとき（`/blog/a` から `/blog/b` など）、ページの木を作り直さずに次の値の props で描き直す。値ごとに部品の状態を初めに戻すため、動的なページは描く部分の根の要素に値で key を付ける（記事は `BlogLayoutContent` の `ArticleFrame`、タグは `TagContent`、デッキは `SlideArticle`）
- router は、layout の外へ移ると、その layout から下の部品を DOM ごと捨てる。ページを移っても保つ状態（縦書きの切り替え）の Provider は、使うページの layout ではなくルートの layout に置く。ルートに置いて保てるのは React の状態だけで、DOM の状態（縦書きの本文の横のスクロールなど）は戻らない。殻にはどのページにも要るものだけを置く、という決まりの例外
- ヘッダーのお問い合わせ（`components/site/contact-to-me`）は、`HeaderActions` が Suspense で包まずに描くので、HTML のヘッダーにボタンと閉じた dialog が出る。JS なしでもボタンは出て、押しても dialog は開かない（テーマのボタンと同じ）
- dev だけで動かす部品（`components/site/react-scan`）は、部品の中で `import.meta.env.DEV` を見て、依存を動的に import する。描く側で `import.meta.env.DEV &&` としても、部品のモジュールは client のバンドルに入り、それが静的に読む依存の読み込みの処理も本番で走る

## 記事の MDX

- MDX は `vite.config.ts` の `@mdx-js/rollup`（`enforce: 'pre'`）が JSX にする。remark・rehype は `@repo/mdx-preset` の preset
- 記事のページ（`routes/blog/[slug]/page.tsx`）は、`components/blog/blog-article` が `import.meta.glob` で集めた MDX を slug ごとに遅れて読み、`components/site/mdx-base` の `MdxContent` で描く。`MdxContent` は mdx-base の部品（見出し・コードブロックなど）に、渡された部品（記事は `components/blog/blog-mdx-components` の `blogMdxComponents`。BrowserSupportStatus・PlaygroundEmbed・Playground・LinkCard・Image・FloatImage・Alert）を重ねる
- plugin-rsc が import した CSS を載せる包みを付けるのは、CSS を静的に import する `.tsx` などのモジュールが export する、大文字で始まる関数の部品だけ。包んだ部品が、自分の import の木（build ではそれが入るチャンク）の CSS を載せる。だから、MDX を描く部品と、それが読む CSS（mdx-base の CSS Modules とコードハイライトの `@repo/code-highlight/styles.css`）は mdx-base に置く。部品の表だけを export して呼ぶ側で描くと、dev のページにその CSS が載らない
- `.mdx` は包まれないので、glob に `?vite-rsc-css-export=default` を付けて default も包ませる。外すと、記事が読む KaTeX の CSS と記事の CSS Modules が HTML に載らない。ビルドの後に `site/katex-css-guard.ts` が、KaTeX の CSS を import する記事の HTML にその CSS が載っているかを見て、載っていなければビルドを止める
- ページの切り替えでは、移る先が `<ViewTransition>`（コードのタブ）を含んでいても、文書の view transition は始まらない。始まるのは、ページの中でタブを切り替えたとき

## Playground

- デモのセクションは、`components/playgrounds/load-section.ts` が `import.meta.glob('@playgrounds/*/index.ts')` で id ごとに遅れて読む。`/playgrounds/:id` の page と OG の route.ts、記事の `PlaygroundEmbed` は、どれもこれで読む。新しいデモで書き足すのは `playgrounds/ids.ts` と `sections.ts` だけ
- デモは、サーバーの部品（`PlaygroundEmbed`・`SectionDemos`）が `@playgrounds/playground` の枠で包んで描く。`'use client'` のデモはクライアントの部品として、それ以外のデモと枠はサーバーの部品として、その CSS がそのページの HTML に載る
- 記事の部品の表（`blogMdxComponents`）は記事のページが静的に読むので、表に置く `PlaygroundEmbed` と `Playground`（`LazyPlayground`）は、枠とデモを関数の中で読む。静的に読むと、デモの無い記事も枠の CSS を読む
- `/blog/:slug`・`/playgrounds/:id`・`/playgrounds` の route と、それが静的に読む部品は、`@playgrounds/sections` と `@playgrounds`（`index.ts`）を静的に読まない。記事と `/playgrounds/:id` で読むと、デモが id ごとのチャンクに分かれず、どのデモのページも全部のデモを読む。デモを描かない一覧（`PlaygroundsIndex`）で読むと、サーバーで描くデモの CSS を一覧も読むので、関数の中で読む。llms.txt と sitemap.xml の route.ts は HTML を書かないので、静的に読んでよい

## 一覧（`/blog`・`/playgrounds`）

- 検索の `q` は一覧ごとの `definePageState` の url に置き、打つたびに `update()`（既定の replace）で書く。入力は `q` をそのまま出し、絞り込みと群（年・カテゴリ）の組み立てだけを `useDeferredValue` で遅らせる
- static mode では HTML は既定値（全件）で、`?q=` は hydrate のあとに効く。hydrate の前に欄へ打った文字は、欄が付いた時に `q` へ写す（`shared/browser/replay-typed-value.ts` を欄の `ref` に渡す）
- 一覧のカードのリンクは `href()` で組んだ素の `<a>` にする。`components/site/content-card` の `ContentCard` は、呼ぶ側が `href()` で組んだパスを `href` で受ける

## ツールの URL の状態（`/palette-maker`・`/html-nest`・`/radius-maker`）

- 値は区画の `search-params` の `definePageState` の url に文字列のまま置き、`readPaletteUrl` などが読むときに解く。外に貼られたリンクの読みを nuqs の書き方にそろえる（`?h=400` は 360、`?h=12abc` は 12、`?h=` は既定）。範囲の外や壊れた数の文字列は、ほかの値を書いても URL に残り、既定と同じ文字列（`?h=250`）と `s` の表に無い値（`?s=foo`）は消える。読みの約束は `search-params.test.ts` の表に書く。schema を `z.pipe`・`z.transform`・`z.number`・`z.refine` にしないのは、zod の本体が入る `frame-*.js` が大きくなり、どのページも +0.7kB 読むから
- 動かす値（スライダー・かどの取っ手・NumberField）は `shared/browser/use-url-draft` の下書きに置き、ツールの根の要素に `commitProps` を渡して、pointerup・pointercancel・click・keyup・blur で確定する。部品の `onChange` のあとに届くので、部品は `onChange` のままでよい。入力ごとに `update()` すると、WebKit は 200 回を超えたところで `QuotaExceededError` を返し、URL が止まる。ポインタもキーも出ない増減（支援技術の増減）と、離した直後の pointermove が作る下書きにはどの事象も来ないので、値が止まって 0.6 秒たつと書く
- 貼り付けられる欄（トークン名・基準色）は keyup も click も来ないので入力ごとに `commit` し、選ぶ操作（テンプレート・かたちの Select）も選んだ時に `commit` する
- html-nest は下書きを持たず、`update({ el }, { history: 'push' })` で書く。戻る・進むは store が URL を読み直すので、書くものは無い。値が変わらない `update()` は push しない
- static mode の HTML は url の state を既定値で描き、URL の値で開いたときに既定の色や形が一度出るので、本文は `components/site/browser-only` の `BrowserOnly` でブラウザでだけ描く。`fallback` を渡さないので、HTML の `<main>` は見出しと空の digest の `<!--$!-->` になる

## 日々の表示（`/reading-list`・`/browser-support`・`/notifications`）

- ページがビルドで DB を読み（`features/*/interface` の関数を `memoizeInBuild` で覚える）、その値を props で渡す。クライアントの部品は `shared/api/live-snapshot` の `useLiveSnapshot` で api の公開の GET を読み、読めたら差し替える。hydrate はビルドの値で描き、HTML とずらさない。`getBrowserSupportSnapshot` は「直近1週間」の基準の時刻（`nowMs`）も一緒に覚え、HTML とペイロードの 2 回の描画で同じ値にする
- 2 つの一覧の絞り込みは区画の `search-params` の `definePageState` の url に置き、入力ごと・クリックごとに `update()`（既定の replace）で書く。値は「ツールの URL の状態」と同じく文字列のまま持ち、読むときに解く。`z.array` は `?source=1,2` を読めず、`z.stringbool` は `?widely=1` を真に読み、外に貼られたリンク（nuqs の書き方）の読みが変わる
- 一覧は `BrowserOnly` でブラウザでだけ描き、骨組み（`ReadingListSkeleton`・`BrowserSupportFeatureListSkeleton`）を `fallback` に渡す。骨組みは HTML の client-rendered の境界（`<!--$!-->`）の中に出る。骨組みを `loading.tsx` として route に置かないのは、static mode では HTML にも遷移にもほぼ出ず、layout と同じくその CSS をどのページも読むから
- ブラウザ最低版のフロア（`features/browser-support/infrastructure/browser-min-versions.json`）は、ルートレイアウトが読み、ビルドのターゲット（`site/browser-targets.ts`）も作る、コミットした生成物。`pnpm run -F main generate:browser-min-versions [version]` で作り直す。同じ版からリポジトリ直下の `.browserslistrc`（ai の Next.js の Lightning CSS / SWC のターゲット）も書くので、どちらも手で編集しない。api の active データセットとずれると、外形監視（`.github/workflows/browser-support-monitor.yml`）が k8o-bot 名義で作り直しの PR を作り、自動マージする
- 購読の VAPID の公開鍵は、`routes/notifications/page.tsx` がビルドの描画で `process.env` から読み、props で渡す。`import.meta.env` でクライアントへ渡すと、名前を `VITE_` に替えることになる

## スライド

- デッキの route は `/slides/:slug` の 1 本（何を書くかは「ビルドが読むもの」）。MDX は `components/slides/slide-article` が記事と同じく `import.meta.glob`（`?vite-rsc-css-export=default` 付き）で slug ごとに遅れて読み、`MdxContent` にスライドの部品の表を重ねて描く。MDX の `<SlideDeckShell slug>` は QR の URL と同期の名前になるので、ディレクトリ名と同じにする（`features/slides/application/slide-files.test.ts` が確かめる）
- 発表者モードかどうか（`mode`）と、観覧と発表者の生存の知らせの名前（`session`）は `definePageState('slide-deck')` の url に置く。表示する枚の `#<番号>` は state に置き場が無いので、`use-hash-index` が `history.replaceState` と `hashchange` で読み書きする。`history.replaceState(null)` は Navigation API の entry の state も消すので、ルートの layout に entry に置くページの状態を足すと、デッキはページ送りのたびにそれを消す
- static mode の HTML は url の state を既定値で描くので、デッキ全体を `BrowserOnly`（`use(browser())` を Suspense で包む）でブラウザでだけ描く。HTML の `<main>` は見出しの Slides と、空の digest の `<!--$!-->` が 1 つになる
- router は移る先の URL を先に書き、着くまで前のページを画面に残す。そのあいだ画面に残るページの url の state は離れる前の URL の値のままで（発表者のタブは発表者の画面のまま）、そのページで呼んだ `update()` は何も書かない。`@k8ordo/state` を通さずに URL を直に読み書きする部品（デッキの `#<番号>`）は、そのあいだも描き直しやキーや BroadcastChannel で移る先の URL を読み書きしてしまう。そこでデッキは開いたときの pathname を覚え（`useDeckController`）、離れたら番号を最後に読んだ値で止め（`useHashIndex`）、何も書かず、ほかのタブへも送らない。止めないと描き直したときに移る先の hash を読んで 1 枚目に替わり、書くと移る先の URL に `#<番号>` が付き、進んでいる遷移を中断して読み直させる
- `SlideDeckShell` は MDX の子を `hr` で区切り、`Notes` を関数に付けた `$$slideRole` で見分けて、クライアントの `SlideDeck` に渡す。`Notes` は関数の宣言や式で export しない。CSS を import するモジュールでそう書くと、plugin-rsc が CSS を載せる包みの関数に替え、`$$slideRole` が外れてノートが本文に出る

## vercel() の規則と dev

- 全応答のヘッダー・末尾スラッシュの 308・Accept での出し分け・`/reading-list/feed` の中継は、`src/site/vercel-routes.ts` を `vercel()` に渡して `.vercel/output/config.json` に書く。当たるのは Vercel だけで、`vite dev`・`vite preview` には当たらない
- Vercel は `src` をパスの全体に当てる（頭だけの `^/blog/` はどれにも当たらない）。どの `src` も `^` から `$` まで書く（`vercel-routes.test.ts` が確かめる）
- dev のセキュリティヘッダーは `vite.config.ts` のプラグインが付け、`/reading-list/feed` は `server.proxy` で中継する

## ビルドが読むもの

- ビルドが DB を読んで書き出すので、talks / tags / blogs / slides と記事の公開・非公開（マイグレーションでだけ変わる）が画面に出るのは、main のデプロイのとき。本番の workflow は、マイグレーションを流してから main をビルドして出す
- 記事のページと記事の下の URL（`/blog/:slug`・`/blog/:slug/article.md`・`/blog/:slug/og.png`）は、`vite.config.ts` の `paths` が、フィードと llms.txt と同じ公開済みの記事の一覧1つ（`features/blog/application/blogs.ts` の `getBlogs`）から作る。下書きと MDX の無い記事は挙がらず、404 になる。列挙した記事の route.ts が 200 を返さなければビルドが止まる
- Playground のページと OG（`/playgrounds/:id`・`/playgrounds/:id/og.png`）は、`paths` が `playgrounds/ids.ts` から作る。記事の `PlaygroundEmbed` が無いセクションやデモを名指すと、描画が投げてビルドが止まる
- タグのページ（`/tags/:id`）は、`paths` が DB の全タグの id（`features/tags/application/tags.ts` の `getTags`）から作る。中身が 0 件のタグ（下書きか MDX の無い記事だけのタグ）のページも書き、noindex にして sitemap と `/tags` の一覧から外す。この 3 つは、タグの中身を `shared/site/tag-contents.ts` で、MDX のある公開済みの記事（`getBlogContents`）とトークから数える。id は route の `paramsSchema` で正の整数に読むので、ページも `href('/tags/:id', { id })` も数値を受ける。挙げていない id と数字でない値は 404 になる。`vite dev` は `paths` を見ずにスキーマで読むので、ビルドでは 404 の `/tags/01` も dev では描く
- デッキのページと OG（`/slides/:slug`・`/slides/:slug/og.png`）は、`paths` が一覧とフィードと同じ公開済みで MDX のあるスライドの一覧1つ（`features/slides/application/slides.ts` の `getSlides`）から作る。デッキを足すのは `content/slides/<slug>/content.mdx` とマイグレーションだけで（手順は `components/slides/README.md`）、公開していないデッキは 404 になる
- `/sitemap.xml` は `routes/sitemap.xml/route.ts` が `shared/site/sitemap.ts` で書く（並び・lastmod・changefreq と XML の形は `sitemap.test.ts`）。lastmod は記事とデッキの更新日から決め、ビルドの時刻は使わない。Playground は `@playgrounds/sections` の並びで、`paths` が読む `ids.ts` の並びとは違う。`framework()` には `site` を渡さない。渡すと framework も描いたページを pathname の辞書順に並べた `sitemap.xml` を書くので、route.ts の出力と重なり、ビルドが描く前に止まる
- `paths` は `vite.config.ts` の側で走る。設定のバンドルは `@repo/database` を外に出し、Node がそのまま読むと落ちるので、DB を読むモジュールは Vite の `runnerImport` で読む
- OG は route.ts の GET が satori と `@resvg/resvg-js` で PNG にする（`shared/og`）。フォントは `shared/og/fonts` に置いたものだけを使い、ビルドで足りない字形をネットから取らない。足りない字形があれば route.ts の GET が reject し、ビルドが止まる。字を足すときは `shared/og/fonts` にフォントを置く

## セキュリティヘッダー

`src/site/security-headers.ts` の CSP・`Content-Security-Policy-Report-Only`・Reporting-Endpoints・`Cross-Origin-Opener-Policy` などを、`vercel()` の規則が全応答に付ける（dev は `vite.config.ts` のプラグイン）。どちらの CSP の違反も `csp-endpoint`（api の `/public/reports`）に届き、api の MCP の `list_reports`（type は `csp-violation`）で読める。

- 頭の CSP の `script-src` は `'unsafe-inline'` のまま置く。頭はページごとのハッシュを持てず、ハッシュを並べると `'unsafe-inline'` が効かなくなるため。inline の script は、`framework()` の `csp` が各ページの `<head>` の先頭の `<meta charset>` のすぐ後ろに書く、ハッシュだけの `<meta>` の CSP（`security-headers.ts` の `pagePolicy`）で縛る。script は頭と `<meta>` の両方が許すときだけ動くので、`<meta>` にハッシュの無い inline の script は動かない。framework は payload と React の inline の script のハッシュを足し、`pagePolicy` はテーマの script のハッシュ（`colorSchemeScriptHash()`）と、頭と同じ外の script の読み先を渡す。テーマの script（ルートの layout の `<head>` の `ColorSchemeScript`）は渡した値（渡すなら `defaultPreference`）を中身に持つので、`vite.config.ts` の `colorSchemeScriptHash()` にも同じ値を渡す。`<meta>` の CSP の違反はレポートに届かない
- Vercel の Toolbar のための `https://vercel.live` は、preview のビルドの CSP（頭の `script-src`・`frame-src` と `<meta>` の `script-src`）にだけ入る。preview かどうかは、`.github/workflows/vercel-prebuilt.yml` の deploy の job が付ける `DEPLOY_TARGET`（push は production、ほかは preview）で決まる。`DEPLOY_TARGET` の無いビルドは production の形になる
- `Cross-Origin-Opener-Policy: same-origin` を付け、ほかのオリジンの窓と閲覧の文脈を分ける。サイトの中で窓を開くのはスライドの発表者モードの `window.open` だけで、開く先は同じオリジンのデッキ
- Trusted Types は Report-Only で観測している。`require-trusted-types-for 'script'` と `trusted-types 'none'` は Report-Only にだけ置き、強制側の CSP には置かない。`trusted-types 'none'` は、ポリシーを作るもの（`trustedTypes.createPolicy()`）を違反として報告させる。default ポリシーは作らない。作ると sink に渡した文字列がそこで変換され、Report-Only の違反として上がらなくなる。生の文字列を渡した sink は、body の `disposition` が `report`、`effectiveDirective` が `require-trusted-types-for` のレポートになり、`sample` に sink 名と値の先頭が、`sourceFile` と行番号に呼び出し元が入る

## テストと Storybook

- Vitest の project は site・features・shared・components（部品の単体テスト）・playgrounds・scripts と storybook
- Storybook は `@storybook/react-vite`（`pnpm -F main storybook`、port 6006）。Storybook MCP は `main-storybook-mcp`（props の確かめ方はルートの CLAUDE.md の「UI共通」）。Storybook と vitest の storybook の project は `.storybook/vite.config.ts` を読み、アプリの `vite.config.ts`（framework()・vercel()）は読まない
- features を読むサーバーの部品（`BlogLayout`・`BrowserSupportStatus`）は、描く部分（`BlogLayoutContent`・`BrowserSupportStatusLive`）を別の部品にし、story は描く部分を描く。features は `node:fs` などを読むので、Storybook のブラウザでは読めない
- テーマは toolbar か `parameters.theme` で決め、`ColorSchemeProvider` の `defaultPreference` に渡す。Story ごとに localStorage のテーマと `@k8ordo/state` の状態を消す
- Storybook には Navigation API を拾う router が無く、`@k8ordo/state` の url を書く `update()` はそのままでは iframe を読み込み直す。URL を読む・書く部品の story は、`.storybook/url-state-story.ts` の `interceptUrlNavigation` を `beforeEach` に渡す。Story の前に `parameters.query`（`q=css` のような query の文字列）と `parameters.hash` を URL に足し、同じ文書の `navigate` を `intercept()` で止め、Story のあとに Story の前の URL（pathname・search・hash）と `history.state` へ戻す。Navigation API の entry の state（`definePageState` の `entry`）は前後の `history.replaceState` で消えるので、Story は空の entry の state から始まり、Story のあとも戻らない
- Storybook では url の state は URL に従う。移るあいだ画面に残るページの値（離れる前の URL の値）で描く部品の story は、部品を `@k8ordo/router` の `<Router>` の下に置き、解けない `React.lazy` の部品の route へ移って、そのあいだをつくる（デッキの移るあいだの story）
- Story は描いた時から React が欄を持つので、hydrate の前に欄へ打った文字を `q` へ写すことは、`.storybook/url-state-story.ts` の `hydrateAfterTyping`（サーバーで描いた HTML を置き、欄に打ってから hydrate する）で確かめる。この story は終わると canvas に何も残らないので `vrt.skip` にする
- VRT（`.github/workflows/vrt.yml`）は、story ごとのスクリーンショットを main の前回のスクリーンショットと比べる

## 環境変数

ビルドの描画でサーバーの部品が `process.env` を読む。ビルドは DB を読むので、`K8O_TURSO_*` が要る。

- 手元の値は、ルートの `fnox.toml` の main の profile に置く（ローカルの DB の URL とダミーのトークン）。`dev` の script は `fnox exec -P main --` で包んであり、手元でビルドするときも `fnox exec -P main -- pnpm -F main build` と包む。fnox の値は、シェルにある同じ名前の値より勝つ
- 本番と preview のビルドは、`vercel pull` した main のプロジェクトの値を読む。DB の接続情報の置き場所は `packages/database/CLAUDE.md`。`VAPID_PUBLIC_KEY` は Shared Environment Variables に置き、api と共有する
- `GOOGLE_ANALYTICS_ID` があると、ルートレイアウトが GA の script と `public/ga-init.js` を読み、`ga-init.js` がページの替わった遷移ごとに page_view を送る。これは GA の管理画面で拡張計測の「ブラウザの履歴イベントに基づくページの変更」を切ってある前提で動く。k8ordo の router は push の遷移で pushState を呼ばないので拡張計測に拾われないが、戻る・進むは popstate で拾われ、設定を切らないと二重に数える
- `VAPID_PUBLIC_KEY` は /notifications の購読の公開鍵で、空のビルドは購読のボタンを出さずに「対応していません」を出す

## 型

`.k8ordo/` の route の表と型は `vite build`・`vite dev`・`k8ordo generate` が書く（git に入れない）。`k8ordo generate` は DB も `paths` も読まずに書くだけなので、type-check の script は先にこれを流し、CI は check の前にも流す（static の断りは見ないので、それはビルドで分かる）。

llms.txt が Playground のセクションを読むので、type-check はデモの TSX も通る。CSS Modules の型（記事とデモのものを含む）は、type-check の `better-css-modules generate` が `__generated__` に書き、`tsconfig.json` の `rootDirs` で読む。型が無いと styles のクラスが `string | undefined` になり、type-aware の lint が誤って落とすので、CI は check の前にも書く。React と DOM の型の補いは `src/react.d.ts`・`src/dom.d.ts` に置く。
