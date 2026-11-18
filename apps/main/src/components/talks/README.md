# トークのデッキ

トークのスライドを k8o.me に置き、`/talks/<slug>` で観覧できるようにするガイド。デッキは、PDF から作るか、MDX で書く。

デッキは `talks` の行の持ち物で、題・イベント・日付・タグはその行から出る。行の `slug` が入っていて中身のあるトークだけがデッキのページを持ち、`/talks` のカードと、解説の記事の「スライドを見る」がそのページを指す。`slug` の無いトークは `slide_url`（外のスライド）を指し、どちらも無ければリンクを出さない。

## PDF からデッキを作る

PDF のデッキは、ページの画像を枠（観覧・発表者モード・進捗バー・キー操作）の全面に描く。透かし・QR・余白は重ねない。PDF のリンクは同じ位置で押せ、ページの文字は画像の alt になる。元の PDF はストアに保管するだけで、サイトでは配らない。アニメーションと動画は出ない。

デッキを開いた時に全ページの画像を読むので、ページ送りで待たず、開いたあとは回線が切れても最後まで送れる。

リポジトリは公開なので、デッキの中身（ページの画像・元の PDF・文字）はコミットせず、Vercel Blob の非公開ストアに置く。`slug` を入れるまで、中身はどこからも読めない。

### 1. 変換して上げる

```bash
fnox exec -P vercel -- pnpm run -F main upload:talk-deck ./my-talk.pdf --slug my-talk --notes ./my-talk-notes.md
```

`--notes` は発表者ノートのテキストで、省ける。`---` だけの行でページごとに分け、n 番目の塊が n ページ目のノートになる。ノートは発表者モードにだけ出るが、ページのデータには入るので、読まれて困ることは書かない。

```
表紙。挨拶して題を読む。

---

自己紹介は 30 秒で。

---
---

4 ページ目のノート（3 ページ目は無し）。
```

`public/talks/my-talk/`（git は見ない）と、ストアの `talks/my-talk/` に次を書く。元の PDF はストアにだけ置く。同じ slug で流し直すと置き換わる。`--local` は手元に書くだけで上げない。

```
deck.json               ページごとの寸法・文字・ノート・リンクの位置
deck.pdf                元の PDF（ストアだけ。保管用で、サイトには出ない）
pages/001.960w.avif     ページの画像（960w と 1920w）
pages/001.1920w.avif
```

### 2. デッキを出す

`packages/database/migrations/` に custom migration を足し（`pnpm run -F @repo/database generate:custom`）、トークの行に `slug` を入れてマージする。トークの行は、デッキより先に入れておける。

```sql
UPDATE talks SET slug = 'my-talk' WHERE title = 'My Talk' AND event_date = '2026-05-15';
```

本番のビルドが、`slug` を持ち MDX の無いトークの中身をストアから `public/talks/<slug>/` へ取り込んで配る。ストアに中身の無い `slug` を入れると、本番のビルドが止まる。

preview のビルドはストアを読まず、すでに k8o.me に出ているデッキを公開のファイルから写す。まだ本番に出ていないデッキは preview に出ず、カードは外のスライドを指す。手元も同じで、`upload:talk-deck` が書いた `public/talks/<slug>/` があればそれを使い、無ければ公開済みのものを写す。どちらも、DB の行に `slug` が入っているトークだけが対象になる。

### 発表の時刻まで出さない

発表の前に準備だけ済ませておくときは、`slug` と一緒に `deck_published_at`（オフセット付きの ISO 8601）を入れる。この時刻までは、ビルドがデッキを取り込まず、ページも作らない。カードはデッキへのリンクと表紙を出さずに並ぶ。MDX のデッキにも効く。

```sql
UPDATE talks SET slug = 'my-talk', deck_published_at = '2026-05-15T13:00:00+09:00' WHERE title = 'My Talk' AND event_date = '2026-05-15';
```

サイトは静的なので、時刻を過ぎたあとのビルドで出る。`.github/workflows/vercel-prebuilt.yml` が 15 分おきに、時刻を過ぎたのに k8o.me に無いデッキを探し、あれば本番の main を建て直す。定期実行は数分〜十数分遅れることがあるので、発表の開始より 30 分ほど前の時刻を入れる。見るのは公開時刻から 3 時間までで、それを過ぎても出ていなければ、Actions の Vercel Prebuilt Deploy を見て main を手で流し直す。

オフセットの無い時刻や読めない時刻は、ビルドが止まる。

## MDX でデッキを書く

`apps/main/src/content/talks/<slug>/content.mdx` を置き、トークの行に `slug` を入れる。

```mdx
<SlideDeckShell slug="my-talk" title="My Talk">

<Cover>

# タイトル

## サブタイトル

2026年5月 / 自分の名前

</Cover>

---

## 1枚目

本文。

<Notes>発表者向けメモ。発表者モードのみ表示。</Notes>

---

## まとめ

ありがとうございました。

</SlideDeckShell>
```

`<SlideDeckShell slug>` は QR の URL と発表者モードの同期の名前になるので、ディレクトリ名と同じにする（`features/talks/application/deck-files.test.ts` が確かめる）。

## 利用できるコンポーネント

MDX では import せずに使う。`slide-mdx` の部品を、`slide-article` が `slide-mdx-components` の `slideMdxComponents` で渡す。MDX は `@/`・`next`・`next-themes` を import しない（`features/talks/application/deck-files.test.ts` が確かめる）。

| Component | 用途 |
|---|---|
| `<SlideDeckShell slug title>` | デッキの最上位ラッパー (必須)。`slug` と `title` を渡す |
| `<Cover>` | 表紙レイアウト。中央配置 + 大見出し用 |
| `<Image src alt width height caption?>` | `public` に置いた画像。`src` に URL、`width`・`height` に画像の寸法を渡す |
| `<Notes>` | 発表者ノート。観覧側には表示されない |

## MDX 記法

| 書く | 結果 |
|---|---|
| `---` (前後に空行) | スライド区切り |
| `## 見出し` | スライドタイトル (primary teal + 下線) |
| `` ```ts ``で囲ったブロック | シンタックスハイライト付きコード (`@repo/code-highlight`) |
| `**bold**` | (slides の `<strong>` は primary teal) |
| `> 引用` | blockquote (primary 縦線) |

画像は markdown `![]()` ではなく `<Image src="..." width={...} height={...} />` を使う。画像は `pnpm run -F main optimize:image` で AVIF にして `apps/main/public/talks/<slug>-<名前>.avif` に置き、`src` に `/talks/<slug>-<名前>.avif` を渡す。

## キーボード操作

| キー | 動作 |
|---|---|
| `→` / `↓` / `Space` / `PageDown` | 次のスライド |
| `←` / `↑` / `PageUp` | 前のスライド |
| `Home` | 1 枚目 |
| `End` | 最後 |
| `F` | フルスクリーン toggle |

## 発表者モード

`/talks/<slug>?mode=presenter` を別タブで開くと、現在スライド + 次スライド + Notes が同時に見える 3 枠レイアウトになる。`BroadcastChannel` で観覧側と双方向同期。

想定運用: 別モニタで発表者モードを開きつつ、観覧モードのタブ (or ウィンドウ) を画面共有する。

## PDF 出力

MDX のデッキは、観覧モードのヘッダーにある **「PDF出力」** ボタン (または `Ctrl` / `Cmd` + `P`) でブラウザの印刷ダイアログを開き、「PDF として保存」で書き出せる。

- 全スライドが 1 枚 1 ページ (16:9) で出力される
- **表示中のテーマの配色** (背景・シンタックスハイライト等) をそのまま引き継ぐ。@k8ordo/ui は印刷で `.dark` の色を light に戻すが、印刷用の描画の root に付けた `print-as-shown` を含む `.dark` だけはダークのまま残す。背景は `print-color-adjust: exact` で刷るので、ダークテーマ表示中はダークのまま出力される
- 印刷用の描画は `slide-deck/deck-print` が担当し、`body` 直下へ portal して他のサイト要素を `@media print` で隠す
- Chrome (v136 未満) 向けに `-webkit-print-color-adjust` も併記している。ダイアログの「背景のグラフィック」設定に依存せず色が出る

## 表示の中身

- ステージは **16:9 固定**。タイポグラフィは container query 単位 (`cqi`) でステージ幅に追従
- 背景に k8o ロゴ (クラゲ) の watermark
- 右下に **`https://k8o.me/talks/<slug>` の QR コード**
- 上端に teal の **進捗バー** (現在位置/総数)

## ディレクトリ構成

```
apps/main/src/routes/talks/
├── [slug]/
│   ├── og.png/route.ts         デッキの OG
│   └── page.tsx                デッキ
├── og.png/route.ts             /talks の OG
└── page.tsx                    /talks 一覧

apps/main/src/components/talks/
├── talks-index/                /talks 一覧
├── talk-card/                  /talks 一覧のカード
├── deck-frame/                 /talks/<slug> の枠
├── pdf-deck-article/           PDF のデッキのマニフェストを読んで描く
├── pdf-page/                   PDF の 1 ページ（画像とリンク）
├── slide-article/              デッキの MDX を slug ごとに読んで描く
├── mdx-parts/                  MDX タグの上書き
├── slide-mdx/                  writer 向け JSX 部品
├── slide-mdx-components/       mdx-parts と slide-mdx の部品をまとめた slideMdxComponents
├── slide-deck/                 デッキ実装 (viewer / presenter / stage / hooks 等)
└── split-slides/               スライド分割と Notes の識別 (split-slides / notes-marker)
```
