# カラーシステム

ArteOdyssey のカラーは「穏やかさ」を第一に設計されている。

## 設計思想

- **60-30-10 ルール**: 60% ニュートラル（グレー系）、30% サポート（bg-subtle 等）、10% アクセント（primary/secondary）
- Primary に Teal、Secondary に Cyan を使用
- ダークモードは「ライトモードの反転」ではなく、独立したトーンで設計
- セマンティックトークンを使えばダークモードは自動対応

## セマンティックカラー（前景）

| Tailwind クラス | Light | Dark | 用途 |
|-----------------|-------|------|------|
| `text-fg-base` | gray-900 | gray-50 | 基本テキスト |
| `text-fg-subtle` | gray-400 | gray-500 | プレースホルダー |
| `text-fg-mute` | gray-700 | gray-300 | 補足テキスト |
| `text-fg-inverse` | gray-50 | gray-900 | 反転テキスト |
| `text-fg-info` | blue-700 | blue-300 | 情報 |
| `text-fg-success` | green-700 | green-300 | 成功 |
| `text-fg-warning` | yellow-700 | yellow-300 | 警告 |
| `text-fg-error` | red-700 | red-300 | エラー |

## セマンティックカラー（背景）

| Tailwind クラス | Light | Dark | 用途 |
|-----------------|-------|------|------|
| `bg-bg-base` | white | gray-900 | 基本背景 |
| `bg-bg-subtle` | gray-100 | gray-800 | 控えめな背景 |
| `bg-bg-mute` | gray-200 | gray-700 | ホバー状態用 |
| `bg-bg-emphasize` | gray-300 | gray-600 | アクティブ状態用 |
| `bg-bg-inverse` | gray-900 | white | 反転背景 |

## セマンティックカラー（ボーダー）

| Tailwind クラス | Light | Dark | 用途 |
|-----------------|-------|------|------|
| `border-border-base` | gray-400 | gray-600 | 標準ボーダー |
| `border-border-subtle` | gray-100 | gray-900 | 薄いボーダー |
| `border-border-mute` | gray-200 | gray-800 | 控えめボーダー |
| `border-border-emphasize` | gray-500 | gray-500 | 強調ボーダー |

## ブランドカラー（Primary: Teal）

| Tailwind クラス | Light | Dark | 用途 |
|-----------------|-------|------|------|
| `text-primary-fg` | teal-700 | teal-300 | Primary テキスト |
| `bg-primary-bg` | teal-300 | teal-700 | Primary 背景 |
| `bg-primary-bg-subtle` | teal-100 | teal-900 | 薄い Primary 背景 |
| `bg-primary-bg-mute` | teal-200 | teal-800 | 控えめ Primary 背景 |
| `border-primary-border` | teal-600 | teal-600 | Primary ボーダー |

## ブランドカラー（Secondary: Cyan）

| Tailwind クラス | Light | Dark | 用途 |
|-----------------|-------|------|------|
| `text-secondary-fg` | cyan-700 | cyan-300 | Secondary テキスト |
| `bg-secondary-bg` | cyan-300 | cyan-700 | Secondary 背景 |
| `bg-secondary-bg-subtle` | cyan-100 | cyan-900 | 薄い Secondary 背景 |
| `border-secondary-border` | cyan-600 | cyan-600 | Secondary ボーダー |

## 使い方の例

```tsx
// 基本的なカード風レイアウト
<div className="bg-bg-base border border-border-mute rounded-lg p-6">
  <h2 className="text-fg-base font-bold">タイトル</h2>
  <p className="text-fg-mute mt-2">補足テキスト</p>
  <span className="text-primary-fg">アクセントテキスト</span>
</div>

// ホバー状態
<button className="bg-bg-base hover:bg-bg-mute transition-colors">
  ボタン
</button>
```

## やってはいけないこと

- グラデーション背景（`bg-gradient-to-*`）
- 彩度の高い色の広範囲使用（アクセントは小面積で）
- 透明度による状態表現（`/90`, `/80` など）— 専用のセマンティックカラーを使う
- ホバーに `bg-primary-bg` を使う — `bg-bg-mute` を優先
- 生のカラー値（`bg-teal-500`）— セマンティックトークンを使う
- ダークモードで単純にカラーを反転させる
