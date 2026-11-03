# Slides

スライド機能の使い方ガイド。MDX でスライドを書き、`/slides/<slug>` で観覧できる。

## 新しいスライドを追加する

### 1. DB にレコードを追加

`packages/database/migrations/` に custom migration を追加 (`pnpm run -F @repo/database generate:custom`)。`slides` テーブルに 1 行 insert する。

`id` は手で振らず、自然キー (`slug`) で `ON CONFLICT DO NOTHING` を使う (autoincrement で採番済みの行と衝突させないため。詳細は `packages/database/CLAUDE.md`)。

```sql
INSERT INTO slides (slug, published, created_at)
  VALUES ('my-talk', 1, '2026-05-15T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;
```

### 2. 本文のディレクトリを作成

```
apps/main/src/content/slides/<slug>/
└── content.mdx         # スライド本体
```

route は `/slides/:slug` の 1 本で、ビルドが公開済みで MDX のあるデッキごとにページと OG（`/slides/<slug>/og.png`）を書き出す。題と説明は frontmatter の `title`・`description` から入る。

### 3. `content.mdx`

```mdx
---
title: My Talk
description: 何の話か
createdAt: 2026-05-15
updatedAt: 2026-05-15
---

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

`<SlideDeckShell slug>` は QR の URL と発表者モードの同期の名前になるので、ディレクトリ名と同じにする（`features/slides/application/slide-files.test.ts` が確かめる）。

## 利用できるコンポーネント

MDX では import せずに使う。`slide-mdx` の部品を、`slide-article` が `slide-mdx-components` の `slideMdxComponents` で渡す。MDX は `@/`・`next`・`next-themes` を import しない（`features/slides/application/slide-files.test.ts` が確かめる）。

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

画像は markdown `![]()` ではなく `<Image src="..." width={...} height={...} />` を使う。画像は `pnpm run -F main optimize:image` で AVIF にして `apps/main/public/slides/<slug>-<名前>.avif` に置き、`src` に `/slides/<slug>-<名前>.avif` を渡す。

## キーボード操作

| キー | 動作 |
|---|---|
| `→` / `↓` / `Space` / `PageDown` | 次のスライド |
| `←` / `↑` / `PageUp` | 前のスライド |
| `Home` | 1 枚目 |
| `End` | 最後 |
| `F` | フルスクリーン toggle |

## 発表者モード

`/slides/<slug>?mode=presenter` を別タブで開くと、現在スライド + 次スライド + Notes が同時に見える 3 枠レイアウトになる。`BroadcastChannel` で観覧側と双方向同期。

想定運用: 別モニタで発表者モードを開きつつ、観覧モードのタブ (or ウィンドウ) を画面共有する。

## PDF 出力

観覧モードのヘッダーにある **「PDF出力」** ボタン (または `Ctrl` / `Cmd` + `P`) でブラウザの印刷ダイアログを開き、「PDF として保存」で書き出せる。

- 全スライドが 1 枚 1 ページ (16:9) で出力される
- `print-color-adjust: exact` により、**表示中のテーマの配色** (背景・シンタックスハイライト等) をそのまま引き継ぐ。ダークテーマ表示中はダークのまま出力される
- 印刷用の描画は `slide-deck/deck-print` が担当し、`body` 直下へ portal して他のサイト要素を `@media print` で隠す
- Chrome (v136 未満) 向けに `-webkit-print-color-adjust` も併記している。ダイアログの「背景のグラフィック」設定に依存せず色が出る

## 表示の中身

- ステージは **16:9 固定**。タイポグラフィは container query 単位 (`cqi`) でステージ幅に追従
- 背景に k8o ロゴ (クラゲ) の watermark
- 右下に **`https://k8o.me/slides/<slug>` の QR コード**
- 上端に teal の **進捗バー** (現在位置/総数)

## ディレクトリ構成

```
apps/main/src/routes/slides/
├── [slug]/
│   ├── og.png/route.ts         デッキの OG
│   └── page.tsx                デッキ (本文は src/content/slides/<slug>/content.mdx)
├── feed/route.ts               RSS feed
├── og.png/route.ts             /slides の OG
└── page.tsx                    /slides 一覧

apps/main/src/components/slides/
├── mdx-parts/                  MDX タグの上書き
├── slide-mdx/                  writer 向け JSX 部品
├── slide-mdx-components/       mdx-parts と slide-mdx の部品をまとめた slideMdxComponents
├── slide-article/              デッキの MDX を slug ごとに読んで描く
├── slide-deck/                 デッキ実装 (viewer / presenter / stage / hooks 等)
├── split-slides/               スライド分割と Notes の識別 (split-slides / notes-marker)
├── slides-frame/               /slides と /slides/<slug> の枠
├── slide-card/                 /slides 一覧用カード
└── slide-index/                /slides 一覧
```
