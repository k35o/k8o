# Slides

スライド機能の使い方ガイド。MDX でスライドを書き、`/slides/<slug>` で観覧できる。

## 新しいスライドを追加する

### 1. DB にレコードを追加

`packages/database/migrations/` に custom migration を追加 (`drizzle-kit generate:custom`)。`slides` テーブルに 1 行 insert する。

`id` は手で振らず、自然キー (`slug`) で `ON CONFLICT DO NOTHING` を使う (admin が autoincrement で採番した行と衝突させないため。詳細は `packages/database/AGENTS.md`)。

```sql
INSERT INTO slides (slug, published, created_at)
  VALUES ('my-talk', 1, '2026-05-15T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;
```

### 2. ルートディレクトリを作成

```
apps/main/src/app/slides/(decks)/<slug>/
├── layout.tsx          # metadata, OG タグ
├── page.tsx            # MDX を render
├── content.mdx         # スライド本体
└── opengraph-image.tsx # (任意) OG 画像
```

### 3. `page.tsx`

```tsx
import { slideMDXComponents } from '@/app/slides/_components/mdx-parts';

import Content from './content.mdx';

export default function Page() {
  return <Content components={slideMDXComponents} />;
}
```

### 4. `content.mdx`

```mdx
---
title: My Talk
description: 何の話か
createdAt: 2026-05-15
updatedAt: 2026-05-15
---

import {
  Cover,
  Image,
  Notes,
  SlideDeckShell,
} from '@/app/slides/_components/slide-mdx';

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

### 5. `layout.tsx`

`(decks)/sample-deck/layout.tsx` を雛形に metadata を埋める。

## 利用できるコンポーネント

`@/app/slides/_components/slide-mdx` から import する。

| Component | 用途 |
|---|---|
| `<SlideDeckShell slug title>` | デッキの最上位ラッパー (必須)。`slug` と `title` を渡す |
| `<Cover>` | 表紙レイアウト。中央配置 + 大見出し用 |
| `<Image src alt caption?>` | 静的インポート画像。`StaticImageData` を `src` に渡す |
| `<Notes>` | 発表者ノート。観覧側には表示されない |

## MDX 記法

| 書く | 結果 |
|---|---|
| `---` (前後に空行) | スライド区切り |
| `## 見出し` | スライドタイトル (primary teal + 下線) |
| `` ```ts ``で囲ったブロック | シンタックスハイライト付きコード (`@repo/code-highlight`) |
| `**bold**` | (slides の `<strong>` は primary teal) |
| `> 引用` | blockquote (primary 縦線) |

画像は markdown `![]()` ではなく `<Image src={...} />` を使う。リモート URL は受け付けない (`StaticImageData` のみ)。

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
- 印刷用の描画は `_components/slide-deck/deck-print` が担当し、`body` 直下へ portal して他のサイト要素を `@media print` で隠す
- Chrome (v136 未満) 向けに `-webkit-print-color-adjust` も併記済み。ダイアログの「背景のグラフィック」設定に依存せず色が出る

## 表示の中身

- ステージは **16:9 固定**。タイポグラフィは container query 単位 (`cqi`) でステージ幅に追従
- 背景に k8o ロゴ (クラゲ) の watermark
- 右下に **`https://k8o.me/slides/<slug>` の QR コード**
- 上端に teal の **進捗バー** (現在位置/総数)

## ディレクトリ構成

```
apps/main/src/app/slides/
├── (decks)/<slug>/             各スライドデッキ
│   ├── content.mdx
│   ├── layout.tsx
│   └── page.tsx
├── _components/
│   ├── mdx-parts/              MDX タグの上書き (内部、page.tsx だけが利用)
│   ├── slide-mdx/              writer 向け JSX 部品
│   ├── slide-deck/             デッキ実装 (viewer / presenter / stage / hooks 等)
│   └── slide-card/             /slides 一覧用カード
├── feed/                       RSS feed
├── layout.tsx                  /slides 共通レイアウト
├── opengraph-image.tsx
└── page.tsx                    /slides 一覧
```
