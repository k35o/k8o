# スペーシング・レイアウト

ArteOdyssey は「余白で語る」デザイン。詰め込まず、空間にゆとりを持たせる。

## スペーシングの原則

4pt ベースのスペーシングシステム。Tailwind の標準スケールを使用。

### コンポーネント内部パディング

| 用途 | クラス | 値 |
|------|--------|-----|
| コンパクト | `p-4` | 16px |
| 標準 | `p-6` | 24px |
| ゆったり | `p-8` | 32px |

### リスト・メニューアイテム

```tsx
className="px-3 py-2"  // 水平に余裕、垂直はコンパクト
```

### テキスト間の余白

| 関係性 | クラス | 用途 |
|--------|--------|------|
| 近い要素 | `mt-2` | 説明テキスト、ヘルプテキスト |
| 標準 | `mt-4` | 段落間、フォームフィールド間 |
| セクション間 | `mt-8` | セクション区切り |
| 大セクション間 | `mt-12` | ページレベルの区切り |

## 角丸

| 用途 | クラス |
|------|--------|
| Badge, Tag 等小さい要素 | `rounded-sm` |
| Button, Input | `rounded-md` |
| Card, Modal, Dialog | `rounded-lg` |
| プログレスバー, IconButton | `rounded-full` |

`rounded-2xl` 以上は使わない。

## シャドウ

基本的に使わない。ボーダーで区切りを表現する。

| 用途 | スタイル |
|------|----------|
| Card（shadow） | `shadow-sm`（`appearance="shadow"` 時） |
| Card（bordered） | `border border-border-mute`（`appearance="bordered"` 時） |
| Modal / Dialog / Tooltip | `shadow-md` |
| Dropdown / ListBox | `shadow-md` |
| Button | なし |

`shadow-xl` 以上は使わない。

## レイアウトパターン

### 余白で階層を作る

```tsx
// Good: 余白の差で関連度を示す
<section className="mt-12">
  <Heading level={2}>セクション</Heading>
  <p className="mt-2">直接関連する説明</p>
  <div className="mt-8">やや離れたコンテンツ</div>
</section>

// Bad: すべて同じ余白
<section className="mt-4">
  <Heading level={2}>セクション</Heading>
  <p className="mt-4">説明</p>
  <div className="mt-4">コンテンツ</div>
</section>
```

### カードは万能ではない

すべてのコンテンツをカードに入れる必要はない。余白と Separator で十分なケースが多い。

```tsx
import { Separator } from '@k8o/arte-odyssey/separator';

// Good: Separator で区切る
<div>
  <section>コンテンツA</section>
  <Separator className="my-8" />
  <section>コンテンツB</section>
</div>

// 過剰: すべてカードに入れる
<Card>コンテンツA</Card>
<Card>コンテンツB</Card>
```

## やってはいけないこと

- `gap-1` や `p-1` のような極端に狭いスペーシング
- コンテンツの詰め込み（情報密度より余白を優先）
- ネストされたカード（Card in Card）
- 12 を超える z-index 値
