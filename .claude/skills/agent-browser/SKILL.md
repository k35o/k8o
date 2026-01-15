---
name: agent-browser
description: Webテスト、フォーム入力、スクリーンショット、データ抽出のためのブラウザ自動化。ユーザーがWebサイトのナビゲーション、Webページの操作、フォーム入力、スクリーンショット撮影、Webアプリケーションのテスト、またはWebページからの情報抽出を必要とする場合に使用。
---

# agent-browserによるブラウザ自動化

## クイックスタート

```bash
agent-browser open <url>        # ページに移動
agent-browser snapshot -i       # 参照付きの対話要素を取得
agent-browser click @e1         # 参照を使用して要素をクリック
agent-browser fill @e2 "text"   # 参照を使用して入力欄を埋める
agent-browser close             # ブラウザを閉じる
```

## 基本ワークフロー

1. **ナビゲーション**: `agent-browser open <url>`
2. **スナップショット**: `agent-browser snapshot -i` （`@e1`, `@e2`のような参照を返す）
3. **スナップショットからの参照を使用して対話**
4. **ナビゲーションまたは大きなDOM変更後に再スナップショット**

## コマンド

### ナビゲーション
```bash
agent-browser open <url>      # URLに移動
agent-browser back            # 戻る
agent-browser forward         # 進む
agent-browser reload          # ページをリロード
agent-browser close           # ブラウザを閉じる
```

### スナップショット（ページ解析）
```bash
agent-browser snapshot        # 完全なアクセシビリティツリー
agent-browser snapshot -i     # 対話要素のみ（推奨）
agent-browser snapshot -c     # コンパクト出力
agent-browser snapshot -d 3   # 深さを3に制限
```

### 対話（スナップショットからの@参照を使用）
```bash
agent-browser click @e1           # クリック
agent-browser dblclick @e1        # ダブルクリック
agent-browser fill @e2 "text"     # クリアして入力
agent-browser type @e2 "text"     # クリアせずに入力
agent-browser press Enter         # キーを押す
agent-browser press Control+a     # キーの組み合わせ
agent-browser hover @e1           # ホバー
agent-browser check @e1           # チェックボックスをチェック
agent-browser uncheck @e1         # チェックボックスのチェックを外す
agent-browser select @e1 "value"  # ドロップダウンを選択
agent-browser scroll down 500     # ページをスクロール
agent-browser scrollintoview @e1  # 要素を表示領域にスクロール
```

### 情報取得
```bash
agent-browser get text @e1        # 要素のテキストを取得
agent-browser get value @e1       # 入力値を取得
agent-browser get title           # ページタイトルを取得
agent-browser get url             # 現在のURLを取得
```

### スクリーンショット
```bash
agent-browser screenshot          # 標準出力にスクリーンショット
agent-browser screenshot path.png # ファイルに保存
agent-browser screenshot --full   # フルページ
```

### 待機
```bash
agent-browser wait @e1                     # 要素を待機
agent-browser wait 2000                    # ミリ秒待機
agent-browser wait --text "Success"        # テキストを待機
agent-browser wait --load networkidle      # ネットワークアイドルを待機
```

### セマンティックロケーター（参照の代替）
```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
```

## 例: フォーム送信

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# 出力例: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # 結果を確認
```

## 例: 保存された状態による認証

```bash
# 一度ログイン
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# 後続セッション: 保存された状態をロード
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

## セッション（並列ブラウザ）

```bash
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com
agent-browser session list
```

## JSON出力（パース用）

機械可読な出力のために `--json` を追加:
```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

## デバッグ

```bash
agent-browser open example.com --headed  # ブラウザウィンドウを表示
agent-browser console                    # コンソールメッセージを表示
agent-browser errors                     # ページエラーを表示
```

## 使用上の注意

### タイミング

- ページナビゲーション後は必ず新しいスナップショットを取得
- 動的コンテンツが読み込まれるのを待つために `wait` コマンドを使用
- 要素が表示されない場合は、`scrollintoview` で要素をビューポート内にスクロール

### セキュリティ

- 認証情報は安全に管理し、状態ファイル（`auth.json`など）を公開リポジトリにコミットしない
- テスト環境では専用のテストアカウントを使用

### パフォーマンス

- 不要な完全ページスクリーンショットを避ける
- 必要に応じて `snapshot -i` を使用して対話要素のみに絞る
- 複数のブラウザ操作が必要な場合はセッション機能を活用

### トラブルシューティング

- **要素が見つからない**: `snapshot -i` を再実行して最新の参照を取得
- **クリックが機能しない**: 要素が表示されているか確認、必要に応じて `scrollintoview` を使用
- **タイムアウト**: `wait --load networkidle` でページの読み込み完了を待機

## ユースケース

### Webアプリケーションのテスト

```bash
# ユーザー登録フローのテスト
agent-browser open https://app.example.com/signup
agent-browser snapshot -i
agent-browser fill @e1 "testuser@example.com"
agent-browser fill @e2 "SecurePass123!"
agent-browser click @e3
agent-browser wait --text "Welcome"
agent-browser screenshot signup-success.png
```

### データスクレイピング

```bash
# 商品情報の抽出
agent-browser open https://shop.example.com/products
agent-browser snapshot
agent-browser get text @e5 --json > product-name.json
agent-browser get text @e6 --json > product-price.json
```

### UIの視覚的回帰テスト

```bash
# 複数の画面サイズでスクリーンショットを撮影
agent-browser open https://example.com
agent-browser screenshot desktop.png
agent-browser resize 768 1024
agent-browser screenshot tablet.png
agent-browser resize 375 667
agent-browser screenshot mobile.png
```

### フォームの自動入力

```bash
# 繰り返しフォーム入力の自動化
agent-browser open https://forms.example.com
agent-browser snapshot -i
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"
agent-browser fill @e3 "555-1234"
agent-browser select @e4 "Option 2"
agent-browser check @e5
agent-browser click @e6
```

## 高度な機能

### 複数ページにわたるワークフロー

```bash
# ステップ1: ログイン
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"

# ステップ2: 設定ページに移動
agent-browser open https://app.example.com/settings
agent-browser snapshot -i
agent-browser fill @e7 "New Display Name"
agent-browser click @e8
agent-browser wait --text "Settings saved"
```

### 条件付き操作

```bash
# エラーメッセージの確認
agent-browser open https://example.com/form
agent-browser snapshot -i
agent-browser fill @e1 "invalid-email"
agent-browser click @e2
agent-browser wait --text "Invalid email"
agent-browser screenshot error-state.png
```

### セッション管理

```bash
# 並列テストの実行
agent-browser --session user1 open https://app.example.com
agent-browser --session user2 open https://app.example.com
agent-browser --session user1 fill @e1 "user1@example.com"
agent-browser --session user2 fill @e1 "user2@example.com"
```

## ベストプラクティス

1. **スナップショットファースト**: 対話の前に常にスナップショットを取得
2. **明示的な待機**: `wait` コマンドを使用して非同期操作を処理
3. **エラーハンドリング**: 予期しない状態をキャプチャするためにスクリーンショットを使用
4. **状態の再利用**: 認証状態を保存して繰り返しログインを避ける
5. **JSON出力**: 自動化とパースのために `--json` フラグを使用
6. **セッションの分離**: 並列テストにはセッション機能を使用
7. **デバッグモード**: 問題のトラブルシューティングには `--headed` を使用

## agent-browserとMCPツールの統合

Claude Codeでは、agent-browserに加えてChromeブラウザ用のMCP（Model Context Protocol）ツールも利用できます。

### agent-browser vs MCPツール

| 機能 | agent-browser | MCPツール（Chrome） |
|------|---------------|-------------------|
| 使いやすさ | CLIベース、簡単 | プログラマティック |
| スナップショット | ✅ テキストベース | ✅ DOM構造 |
| 要素参照 | `@e1`, `@e2` | `uid` ベース |
| セッション管理 | ✅ | ✅ |
| スクリーンショット | ✅ | ✅ |
| ネットワーク監視 | ❌ | ✅ DevTools統合 |
| パフォーマンス分析 | ❌ | ✅ トレース機能 |

### 使い分けのガイドライン

**agent-browserを使用する場合:**
- 簡単なフォーム入力やナビゲーション
- テキストベースの要素参照が望ましい場合
- 軽量で迅速な操作

**MCPツール（Chrome）を使用する場合:**
- ネットワークリクエストの監視が必要
- コンソールログの詳細な分析
- パフォーマンストレースと最適化
- より複雑なDOM操作

## まとめ

agent-browserは、Webブラウザの自動化を簡単にするための強力なツールです。スナップショットベースのワークフロー、参照システム、豊富なコマンドセットにより、Webテスト、データ抽出、フォーム自動化などのタスクを効率的に実行できます。

このスキルを使用することで、ユーザーはWebページとの対話を自動化し、反復的なタスクを削減し、Webアプリケーションの品質を向上させることができます。
