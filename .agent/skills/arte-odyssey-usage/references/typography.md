# タイポグラフィ

ArteOdyssey のタイポグラフィは「読みやすさ」と「静けさ」を両立する。

## フォントファミリー

日本語最適化のフォントスタック。

```css
font-family: 'Noto Sans JP', 'M PLUS 2', sans-serif;
```

- **Inter / Roboto / Open Sans は使わない** — AI が生成した感が出る
- 日本語テキストが主体のため、和文フォントを優先

## フォントサイズスケール

| Tailwind クラス | 値 | 用途 |
|-----------------|-----|------|
| `text-xs` | 0.75rem | 注釈、キャプション |
| `text-sm` | 0.875rem | 補足テキスト、ラベル |
| `text-md` | 1rem | 本文（デフォルト） |
| `text-lg` | 1.125rem | 小見出し |
| `text-xl` | 1.25rem | 見出し |
| `text-2xl` | 1.5rem | 大見出し |
| `text-3xl` | 1.875rem | ページタイトル |

## フォントウェイト

ウェイトは控えめに使う。太字の多用は「静けさ」を損なう。

| Tailwind クラス | 値 | 用途 |
|-----------------|-----|------|
| `font-normal` | 400 | 本文 |
| `font-medium` | 450 | 強調テキスト（控えめな強調） |
| `font-bold` | 700 | 見出し、ボタンラベル |

- `font-semibold` (600) や `font-extrabold` (800) は使わない
- `font-medium` が 450 であることに注意（一般的な 500 より軽い）

## 行間

日本語テキストは欧文より広い行間が必要。

- 本文: `leading-relaxed` (1.625) を推奨
- 見出し: `leading-tight` (1.25) か `leading-snug` (1.375)
- リスト内: デフォルトの `leading-normal` (1.5)

## Heading コンポーネント

見出しには `Heading` コンポーネントを使う。

```tsx
import { Heading } from '@k8o/arte-odyssey/heading';

<Heading level={1}>ページタイトル</Heading>
<Heading level={2}>セクション見出し</Heading>
<Heading level={3}>サブセクション</Heading>
```

## やってはいけないこと

- 3種類以上のフォントウェイトを1画面で使う
- `text-3xl` より大きいサイズを使う（ページタイトル以外）
- `uppercase` や `tracking-widest` を日本語テキストに適用する
- テキストにグラデーションをかける
- フォントサイズだけで階層を作る（余白も活用する）
