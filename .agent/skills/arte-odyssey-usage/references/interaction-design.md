# インタラクションデザイン

ArteOdyssey のインタラクションは「静かな変化」を原則とする。

## インタラクティブ状態

8つの状態を意識して設計する。

| 状態 | スタイル |
|------|----------|
| Default | 基本スタイル |
| Hover | `hover:bg-bg-mute` — 穏やかな色変化 |
| Focus | `focus-visible:ring-2 focus-visible:ring-border-info` |
| Active | `active:bg-bg-emphasize` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Loading | スピナーまたはスケルトン |
| Selected | `bg-primary-bg-subtle` |
| Error | `border-border-error` + `text-fg-error` |

## トランジション

控えめで自然な動き。

| 用途 | 推奨設定 |
|------|----------|
| ホバー色変化 | `transition-colors duration-150 ease-out` |
| 透過度変化 | `transition-opacity duration-200 ease-out` |
| サイズ変化を伴う場合 | `transition-all duration-150 ease-out` |

### タイミングの原則

- **100ms**: 即時フィードバック（ボタンプレス）
- **150–200ms**: 標準トランジション（ホバー、フォーカス）
- **300ms**: 開閉アニメーション（Accordion, Drawer の限度）
- **300ms を超えない** — 重く感じる

## フォーカス管理

- `focus-visible` を使う（`focus` ではなく）— マウスクリック時にリングが出ない
- フォーカスリングは `ring-border-info` で統一
- `outline-hidden` でデフォルトのアウトラインを消してから ring を適用

```tsx
className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info"
```

## フォームデザイン

- ラベルは入力の上に配置（左配置は日本語で読みにくい）
- エラーメッセージは入力の直下に `text-fg-error text-sm`
- 必須マークは `*` でラベルの後ろに
- `FormControl` コンポーネントでラベル・エラー表示を統一

```tsx
import { FormControl } from '@k8o/arte-odyssey/form-control';

<FormControl label="メールアドレス" error="入力してください" isRequired>
  <TextField id="email" placeholder="example@mail.com" />
</FormControl>
```

## アクセシビリティ

- `aria-label` / `aria-describedby` を適切に設定
- キーボードナビゲーションを確保（Tab, Enter, Escape, 矢印キー）
- `prefers-reduced-motion` を考慮 — ArteOdyssey の motion ライブラリが自動対応
- カラーだけに頼らない状態表現（アイコンやテキストを併用）

## やってはいけないこと

- bounce / spring 系のイージング
- 300ms を超えるアニメーション
- ホバーに強い原色（`bg-primary-bg`）を使う
- `cursor-pointer` をボタン以外に付ける（リンクにも不要）
