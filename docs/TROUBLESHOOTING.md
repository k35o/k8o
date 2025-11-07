# Troubleshooting Guide

このドキュメントは、k8oプロジェクトでよくある問題と解決策をまとめています。

## 目次

- [セットアップ時の問題](#セットアップ時の問題)
- [開発時の問題](#開発時の問題)
- [テスト時の問題](#テスト時の問題)
- [ビルド時の問題](#ビルド時の問題)
- [デプロイ時の問題](#デプロイ時の問題)
- [データベースの問題](#データベースの問題)
- [パフォーマンスの問題](#パフォーマンスの問題)

## セットアップ時の問題

### pnpm installが失敗する

**症状:**
```
ERR_PNPM_UNSUPPORTED_ENGINE Unsupported engine
```

**原因:** Node.jsのバージョンが要件を満たしていない

**解決策:**
```bash
# Node.jsバージョンを確認
node -v

# 22.21.0にアップデート
nvm install 22.21.0
nvm use 22.21.0

# 再インストール
pnpm install --frozen-lockfile
```

### Dockerサービスが起動しない

**症状:**
```
Error: Cannot connect to Docker daemon
```

**解決策:**
```bash
# Docker Desktopを起動

# サービスを再起動
docker compose down
docker compose up -d

# ログを確認
docker compose logs
```

###  ポートが既に使用されている

**症状:**
```
Error: Port 3000 is already in use
```

**解決策:**
```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>

# または別のポートを使用
PORT=3001 pnpm run dev
```

## 開発時の問題

### 環境変数が読み込まれない

**症状:**
```
TypeError: Cannot read properties of undefined
```

**原因:** `.env.local`が存在しない、または正しく設定されていない

**解決策:**
```bash
# .env.exampleをコピー
cp core/.env.example core/.env.local

# 必要な値を設定
vi core/.env.local

# 開発サーバーを再起動
pnpm run dev
```

### Hot Reloadが動作しない

**解決策:**
```bash
# .nextキャッシュを削除
rm -rf core/.next

# node_modulesを再インストール
pnpm install --force

# 開発サーバーを再起動
pnpm run dev
```

### TypeScriptエラーが大量に出る

**症状:**
```
error TS2307: Cannot find module '@/...'
```

**解決策:**
```bash
# 型定義を生成
pnpm run -F core type-check

# VSCodeを再起動
# Cmd+Shift+P > "Reload Window"
```

### Storybookが起動しない

**症状:**
```
Error: Cannot find module '@storybook/...'
```

**解決策:**
```bash
# Storybook依存関係を再インストール
pnpm install @storybook/nextjs-vite --save-dev

# キャッシュをクリア
rm -rf core/.storybook/cache

# 再起動
pnpm run -F core storybook
```

## テスト時の問題

### Vitestがタイムアウトする

**症状:**
```
Test timed out in 5000ms
```

**解決策:**
```typescript
// テストのタイムアウトを延長
it('時間のかかる処理', async () => {
  // ...
}, 10000); // 10秒
```

### データベーステストが失敗する

**症状:**
```
Error: relation "blogs" does not exist
```

**解決策:**
```bash
# データベースをリセット
docker compose down -v
docker compose up -d

# マイグレーション実行
pnpm run -F core migrate

# テストを再実行
pnpm run test
```

### Playwrightブラウザが起動しない

**症状:**
```
browserType.launch: Executable doesn't exist
```

**解決策:**
```bash
# ブラウザを再インストール
pnpm run install-playwright

# システム依存関係をインストール（Linux）
npx playwright install-deps
```

### Storybookテストが失敗する

**症状:**
```
Cannot find storybook
```

**解決策:**
```bash
# Storybookを起動してからテスト実行
pnpm run -F core storybook

# 別ターミナルで
pnpm run test --project=storybook
```

## ビルド時の問題

### Next.jsビルドが失敗する

**症状:**
```
Error: Failed to compile
```

**解決策:**
```bash
# キャッシュをクリア
rm -rf core/.next

# 再ビルド
pnpm run build

# 詳細ログを確認
ANALYZE=true pnpm run build
```

### メモリ不足エラー

**症状:**
```
FATAL ERROR: Reached heap limit
```

**解決策:**
```bash
# Node.jsヒープサイズを増やす
NODE_OPTIONS='--max-old-space-size=4096' pnpm run build
```

### TypeScriptエラー

**症状:**
```
Type error: Property 'foo' does not exist
```

**解決策:**
```bash
# 型定義を更新
pnpm run -F core type-check

# tsconfig.jsonを確認
cat core/tsconfig.json
```

## デプロイ時の問題

### Vercelデプロイが失敗する

**症状:**
```
Error: Build failed
```

**解決策:**
```bash
# ローカルでビルド確認
pnpm run build

# 環境変数を確認
vercel env pull

# ログを確認
vercel logs --follow
```

### 環境変数が反映されない

**解決策:**
```bash
# Vercel Dashboardで環境変数を確認
# https://vercel.com/k35o/k8o/settings/environment-variables

# 環境変数を再設定
vercel env add <KEY> production

# 再デプロイ
vercel --prod --force
```

### データベース接続エラー

**症状:**
```
Error: Unable to connect to database
```

**解決策:**
```bash
# 接続文字列を確認
echo $POSTGRES_URL

# Neonダッシュボードで接続状態を確認
# Connection Poolingが有効か確認

# 接続文字列を再設定
vercel env add POSTGRES_URL production
```

## データベースの問題

### マイグレーションが失敗する

**症状:**
```
Error: Migration failed
```

**解決策:**
```bash
# マイグレーション状態を確認
pnpm run -F core drizzle-kit status

# 手動でロールバック
pnpm run -F core drizzle-kit drop

# 再マイグレーション
pnpm run -F core migrate
```

### データベース接続が遅い

**解決策:**
```typescript
// Connection Poolingを有効化
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  connectionTimeoutMillis: 5000,
});
```

### トランザクションエラー

**症状:**
```
Error: Transaction aborted
```

**解決策:**
```typescript
// リトライロジックを追加
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}
```

## パフォーマンスの問題

### ページ読み込みが遅い

**診断:**
```bash
# Lighthouseで分析
npx lighthouse https://k8o.dev --view

# バンドルサイズを分析
ANALYZE=true pnpm run build
```

**解決策:**
1. 画像の最適化
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // Above the fold
/>
```

2. Dynamic Import
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

3. ISRの活用
```tsx
export const revalidate = 3600; // 1時間ごとに再生成
```

### ビルドが遅い

**解決策:**
```json
// next.config.ts
{
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

### Redisが遅い

**解決策:**
```typescript
// パイプラインを使用
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
await pipeline.exec();

// キャッシュのTTLを設定
await redis.set('key', 'value', { ex: 3600 }); // 1時間
```

## よくある質問 (FAQ)

### Q: Node.jsのバージョンはいくつを使うべきですか？

A: `22.21.0`を推奨します。`package.json`の`engines`フィールドを参照してください。

### Q: pnpmではなくnpm/yarnを使えますか？

A: 推奨しません。monorepoの管理とパフォーマンスのためpnpmを使用してください。

### Q: ローカルでメール送信をテストできますか？

A: はい。React Emailの開発サーバーを使用できます：
```bash
pnpm run -F core email
```

### Q: Storybookでモックデータを使うには？

A: MSWハンドラーを`core/src/mocks/handlers/`に追加してください。

### Q: E2Eテストをデバッグモードで実行するには？

A:
```bash
pnpm run -F core test:e2e --debug
```

### Q: デプロイ前にどんなチェックをすべきですか？

A:
```bash
# すべてのチェックを実行
pnpm run check
pnpm run ls-lint
pnpm run type-check
pnpm run test
pnpm run build
```

## サポートが必要な場合

1. **GitHub Issues**: https://github.com/k35o/k8o/issues
2. **GitHub Discussions**: https://github.com/k35o/k8o/discussions
3. **ドキュメント**: `docs/`ディレクトリ内の各ドキュメント

## 問題が解決しない場合

以下の情報を含めてIssueを作成してください：

- OS とバージョン
- Node.js とpnpmのバージョン
- エラーメッセージ（全文）
- 再現手順
- 期待される動作
- 実際の動作
- スクリーンショット（該当する場合）

---

このドキュメントは継続的に更新されます。新しい問題が発見された場合は、解決策とともに追加してください。
