---
name: arte-odyssey-usage
description: |
  @k8o/arte-odyssey デザインシステムを使ったフロントエンドUI作成ガイド。
  「静謐で落ち着いた、余白を活かしたUI」を原則とするミニマルなデザイン。

  Use when:
  - @k8o/arte-odyssey を使ったページやコンポーネントを作成するとき
  - ミニマルで統一感のあるインターフェースが必要なとき
  - デザイントークンやコンポーネントの正しい使い方を知りたいとき

  特徴: Teal/Cyan カラー、控えめなアニメーション、ゆったりした余白、日本語最適化
---

# ArteOdyssey Design Skill

`@k8o/arte-odyssey` デザインシステムを使って UI を作るためのスキル。

## セットアップ

```bash
npm install @k8o/arte-odyssey
```

```tsx
// 1. スタイルシートを読み込む（エントリポイントで1回）
import '@k8o/arte-odyssey/styles.css';

// 2. Provider でアプリを囲む
import { ArteOdysseyProvider } from '@k8o/arte-odyssey/providers';

function App() {
  return (
    <ArteOdysseyProvider>
      <YourApp />
    </ArteOdysseyProvider>
  );
}

// 3. コンポーネントを使う
import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
```

### Tailwind CSS の設定

`@k8o/arte-odyssey` は Tailwind CSS 4 以上が必要。プロジェクトの CSS で以下を追加：

```css
@import 'tailwindcss';
@import '@k8o/arte-odyssey/styles.css';
```

## デザインの方向性

### コアコンセプト

**「静謐で落ち着いた、余白を活かしたUI」**

- **引き算の美学**: 装飾は最小限。必要なものだけ残す
- **余白で語る**: 詰め込まず、空間にゆとりを持たせる
- **静かな変化**: アニメーションは控えめに、繊細なフィードバック
- **穏やかな色**: 目に優しいトーン、グレー系を活かす

### トーン

「図書館の読書スペース」のような空気感。静かで集中できる、心地よい緊張感。

## 美学ガイドライン

### タイポグラフィ

**DO:**
- 日本語フォント（Noto Sans JP, M PLUS 2）を使う
- フォントウェイトは 3種類まで（`font-normal`, `font-medium`, `font-bold`）
- `font-medium` が 450（一般的な 500 より軽い）であることを活かした繊細な強調

**DON'T:**
- Inter / Roboto / Open Sans を使う
- 4種類以上のフォントサイズを1画面で使う
- テキストにグラデーションをかける

→ [タイポグラフィ詳細](references/typography.md)

### カラー

**DO:**
- 60-30-10 ルール（ニュートラル60%, サポート30%, アクセント10%）
- セマンティックカラートークンを使う（`bg-bg-subtle`, `text-fg-mute` 等）
- ダークモードを独立したトーンで設計する

**DON'T:**
- グラデーション背景
- ホバーに `bg-primary-bg` — `bg-bg-mute` を使う
- 透明度(`/90`)で状態表現 — 専用トークンを使う
- 生のカラー値（`bg-teal-500`）— セマンティックトークン（`bg-primary-bg`）を使う

→ [カラー詳細](references/color.md)

### スペーシング

**DO:**
- `p-6` を標準パディングとする
- 余白の差で関連度を表す（`mt-2` 近い、`mt-4` 標準、`mt-8` セクション間）
- Separator でセクションを区切る

**DON'T:**
- すべてを Card に入れる
- Card を入れ子にする（Card in Card）
- `gap-1` のような極端に狭いスペーシング

→ [スペーシング詳細](references/spatial-design.md)

### インタラクション

**DO:**
- `transition-colors` を基本にする
- `focus-visible:ring-2 focus-visible:ring-border-info` でフォーカス表現
- `hover:bg-bg-mute` で穏やかなホバー

**DON'T:**
- bounce / spring 系のイージング
- 300ms を超えるアニメーション
- ホバーに強い原色を使う

→ [インタラクション詳細](references/interaction-design.md)

## コンポーネント使用の原則

### Button / LinkButton

`color` と `variant` で統一されたスタイル。

```tsx
import { Button } from '@k8o/arte-odyssey/button';
import { LinkButton } from '@k8o/arte-odyssey/link-button';

// プライマリアクション
<Button color="primary" variant="contained">保存する</Button>

// セカンダリアクション
<Button color="gray" variant="outlined">キャンセル</Button>

// テキストのみ
<Button variant="skeleton">詳細を見る</Button>

// リンクボタン（同じ props）
<LinkButton href="/settings" color="gray">設定へ</LinkButton>
```

### IconButton / IconLink

`bg` prop でスタイルを制御（`variant` ではない）。

```tsx
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { IconLink } from '@k8o/arte-odyssey/icon-link';

<IconButton bg="transparent" label="コピー"><CopyIcon /></IconButton>
<IconButton bg="primary" label="送信"><SendIcon /></IconButton>
<IconLink href="/home" bg="base" label="ホーム"><HomeIcon /></IconLink>
```

### Card / InteractiveCard

`appearance` prop でシャドウかボーダーかを選択。

```tsx
import { Card, InteractiveCard } from '@k8o/arte-odyssey/card';

// 静的カード
<Card title="設定" appearance="bordered">
  <p>カードのコンテンツ</p>
</Card>

// クリック可能なカード（ホバーでスケールアップ）
<InteractiveCard title="記事" appearance="shadow">
  <p>コンテンツ</p>
</InteractiveCard>
```

### フォーム

```tsx
import { TextField } from '@k8o/arte-odyssey/text-field';
import { Select } from '@k8o/arte-odyssey/select';
import { FileField } from '@k8o/arte-odyssey/file-field';

<TextField id="email" placeholder="example@mail.com" />

<Select
  label="カテゴリ"
  options={[{ value: '1', label: 'オプション1' }]}
  value={value}
  onChange={onChange}
/>

<FileField.Root accept="image/*" multiple>
  <FileField.Trigger>ファイルを選択</FileField.Trigger>
  <FileField.ItemList />
</FileField.Root>
```

## アンチパターン: 「AI スロップ」を避ける

AI が生成したと一目でわかるUIの特徴を避ける。

| アンチパターン | ArteOdyssey での代替 |
|---------------|---------------------|
| パープルグラデーション | Teal/Cyan のフラットカラー |
| Card in Card（入れ子カード） | Separator + 余白で区切り |
| グレー背景にグレーテキスト | `text-fg-base` / `text-fg-mute` のコントラスト確保 |
| すべてに `rounded-2xl` | `rounded-lg` を基本、用途で使い分け |
| bounce / spring アニメーション | `transition-colors duration-150 ease-out` |
| Inter フォント | Noto Sans JP / M PLUS 2 |
| 過剰な glassmorphism | border + subtle な背景色 |
| 装飾的な絵文字やアイコン | lucide-react の線画アイコンを控えめに |
| 情報の詰め込み | 余白を活かした疎な配置 |

### AI スロップテスト

> このUIを誰かに見せて「AIが作った」と言ったら、すぐに信じるだろうか？
> もし「はい」なら、それが問題だ。

## 実装の原則

- **既存コンポーネントを使う**: カスタムUIの前にまず ArteOdyssey コンポーネントを探す
- **セマンティックトークンを使う**: 生のカラー値（`bg-teal-500`）ではなくトークン（`bg-primary-bg`）
- **ダークモードを忘れない**: セマンティックトークンを使えば自動対応
- **アクセシビリティ**: `aria-label`, キーボードナビゲーション, カラーだけに頼らない状態表現

## 詳細リファレンス

- タイポグラフィ: [references/typography.md](references/typography.md)
- カラーシステム: [references/color.md](references/color.md)
- スペーシング・レイアウト: [references/spatial-design.md](references/spatial-design.md)
- インタラクション: [references/interaction-design.md](references/interaction-design.md)
- コンポーネント一覧: [references/components.md](references/components.md)
