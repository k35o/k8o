# デプロイガイド

このドキュメントは、k8oプロジェクトのデプロイメント手順とインフラ構成を説明します。

## 目次

- [デプロイメント概要](#デプロイメント概要)
- [本番環境](#本番環境)
- [Vercelへのデプロイ](#vercelへのデプロイ)
- [データベース (Turso)](#データベース-turso)
- [CMS (MicroCMS)](#cms-microcms)
- [メール (Resend)](#メール-resend)
- [環境変数](#環境変数)
- [Cronジョブ](#cronジョブ)
- [ドメイン設定](#ドメイン設定)
- [モニタリング](#モニタリング)

## デプロイメント概要

k8oは以下のサービスを使用してデプロイされています：

```
┌─────────────────────────────────────────┐
│          Vercel (Hosting)               │
│    - Next.js Application                │
│    - Serverless Functions               │
│    - Edge Functions                     │
│    - CDN                                │
└────────┬────────────────────────────────┘
         │
         ├──────────────────────┐
         │                      │
┌────────▼─────┐      ┌────────▼───────┐
│    Turso     │      │   MicroCMS     │
│   (libSQL)   │      │     (CMS)      │
└──────────────┘      └────────────────┘
                              │
                      ┌───────▼────────┐
                      │    Resend      │
                      │    (Email)     │
                      └────────────────┘
```

## 本番環境

### サービス一覧

| サービス | 用途 | URL |
|---------|------|-----|
| Vercel | ホスティング | https://vercel.com/k35o/k8o |
| Turso | libSQL (SQLite) | https://app.turso.tech/k8ome/databases/k8o |
| MicroCMS | CMS | https://k35o.microcms.io |
| Resend | Email | https://resend.com |

### デプロイフロー

```
┌──────────────┐
│  Git Push    │ mainブランチへのpush
│  to main     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   GitHub     │ Webhookがトリガー
│   Actions    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Vercel     │ 自動ビルド開始
│   Build      │
└──────┬───────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌──────────┐  ┌──────────┐
│   Test   │  │  Build   │
│          │  │  Check   │
└────┬─────┘  └────┬─────┘
     │             │
     │  成功時のみ  │
     └─────┬───────┘
           ▼
    ┌──────────────┐
    │   Deploy     │
    │ Production   │
    └──────────────┘
```

## Vercelへのデプロイ

### 初回セットアップ

1. **Vercelアカウントと連携**

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトを初期化
vercel
```

2. **GitHubと連携**

Vercelダッシュボードから：
- New Project
- Import Git Repository
- `k35o/k8o`を選択
- Framework Preset: `Next.js`
- Root Directory: `apps/main`

3. **ビルド設定**

```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### 環境変数の設定

Vercelダッシュボードで以下を設定：

```bash
# Database (Turso)
TURSO_DATABASE_URL="libsql://xxx.turso.io"
TURSO_AUTH_TOKEN="..."

# CMS
MICROCMS_API_ENDPOINT="https://k35o.microcms.io/api/v1"
MICROCMS_API_KEY="..."

# Email
RESEND_API_KEY="..."

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-..."

# Vercel
VERCEL_URL (自動設定)
```

### 手動デプロイ

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### Vercel設定ファイル

```json
// apps/main/vercel.json
{
  "crons": [
    {
      "path": "/api/crons/weekly-notifications",
      "schedule": "0 1 * * 6"
    }
  ]
}
```

## データベース (Turso)

### セットアップ

1. **Turso CLIのインストール**

```bash
# macOS
brew install tursodatabase/tap/turso

# その他
curl -sSfL https://get.tur.so/install.sh | bash
```

2. **ログインとデータベース作成**

```bash
# ログイン
turso auth login

# データベース作成
turso db create k8o --location nrt  # Tokyo region

# 接続情報の取得
turso db show k8o --url
turso db tokens create k8o
```

3. **環境変数の設定**

```bash
TURSO_DATABASE_URL="libsql://k8o-xxx.turso.io"
TURSO_AUTH_TOKEN="..."
```

4. **マイグレーション実行**

```bash
pnpm run -F @repo/database migrate
```

### ローカル開発

Turso CLIを使用してローカルでlibSQLサーバーを起動：

```bash
# ローカルサーバー起動（ポート8787）
pnpm run -F @repo/database dev

# 別ターミナルでマイグレーション実行
pnpm run -F @repo/database migrate

# Next.js開発サーバー起動
pnpm run dev
```

ローカル開発時の環境変数（`.env.local`）：
```bash
TURSO_DATABASE_URL="http://127.0.0.1:8787"
TURSO_AUTH_TOKEN=dummy
```

### バックアップ戦略

Tursoは自動バックアップを提供：
- Point-in-time recovery
- ダッシュボードからのスナップショット取得

## メール (Resend)

### セットアップ

1. **ドメイン認証**

Resend Dashboard:
- Add Domain: `k8o.dev`
- DNS レコードを追加:
  ```
  TXT  _resend  resend_...
  MX   @        feedback-smtp.us-east-1.amazonses.com
  ```

2. **APIキー取得**

```bash
RESEND_API_KEY="re_..."
```

### メールテンプレート

React Emailでテンプレート作成：

```bash
# 開発サーバー起動
pnpm run -F main email

# http://localhost:3333 でプレビュー
```

テンプレート例：
```tsx
// apps/main/src/emails/verification-email.tsx
export const VerificationEmail = ({ verificationUrl }: Props) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Heading>メールアドレスを確認してください</Heading>
        <Text>以下のリンクをクリックして確認を完了してください：</Text>
        <Button href={verificationUrl}>確認する</Button>
      </Container>
    </Body>
  </Html>
);
```

## 環境変数

### 必須環境変数

```bash
# Database (Turso)
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."

# CMS
MICROCMS_API_ENDPOINT="https://k35o.microcms.io/api/v1"
MICROCMS_API_KEY="..."

# Email
RESEND_API_KEY="re_..."
```

### オプション環境変数

```bash
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-..."

# Deployment
VERCEL_URL="k8o.dev" # Vercelが自動設定
```

### 環境別設定

| 環境 | ファイル | 用途 |
|-----|---------|------|
| ローカル | `apps/main/.env.local` | 開発環境 |
| Vercel Preview | Vercel Dashboard | プレビューデプロイ |
| Vercel Production | Vercel Dashboard | 本番環境 |

### セキュアな管理

```bash
# 環境変数の暗号化（推奨）
vercel env pull .env.production
vercel env add RESEND_API_KEY production

# .env.localをgitignoreに追加済み
echo "apps/main/.env.local" >> .gitignore
```

## Cronジョブ

### 設定

```json
// apps/main/vercel.json
{
  "crons": [
    {
      "path": "/api/crons/weekly-notifications",
      "schedule": "0 1 * * 6"
    }
  ]
}
```

### スケジュール形式

Cron式（UTC時刻）：
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ 曜日 (0-6, 0=日曜)
│ │ │ └─── 月 (1-12)
│ │ └───── 日 (1-31)
│ └─────── 時 (0-23)
└───────── 分 (0-59)
```

例：
- `0 1 * * 6` - 毎週土曜日 1:00 UTC (10:00 JST)
- `0 0 * * *` - 毎日 0:00 UTC

### ログ確認

```bash
# Vercel CLI
vercel logs

# ダッシュボード
https://vercel.com/k35o/k8o/logs
```

## ドメイン設定

### カスタムドメイン

Vercel Dashboard:
1. Settings > Domains
2. Add Domain: `k8o.dev`
3. DNS設定:
```
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

### SSL証明書

Vercelが自動的に Let's Encrypt 証明書を発行・更新

### リダイレクト設定

```typescript
// next.config.ts
{
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
}
```

## モニタリング

### Vercel Analytics

自動的に有効化：
- ページビュー
- デバイス情報
- リファラー
- パフォーマンスメトリクス

### Vercel Speed Insights

Core Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### Google Analytics

```typescript
// apps/main/src/app/layout.tsx
import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>{children}</body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!} />
    </html>
  );
}
```

### エラートラッキング

```typescript
// Next.js エラーバウンダリー
export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    // エラーログ送信
    console.error(error);
  }, [error]);

  return <ErrorPage />;
}
```

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルド確認
pnpm run build

# 詳細ログ
vercel logs --follow
```

### データベース接続エラー

```bash
# 接続文字列を確認
echo $TURSO_DATABASE_URL

# Tursoダッシュボードで接続状態を確認
# turso db shell k8o で直接接続テスト
```

### 環境変数が反映されない

```bash
# Vercel環境変数を再設定
vercel env pull

# 再デプロイ
vercel --prod --force
```

### Cronが実行されない

- Vercel Proプラン以上が必要
- `vercel.json`の設定を確認
- ログでエラーを確認

## ロールバック

### 前のバージョンに戻す

Vercel Dashboard:
1. Deployments
2. 戻したいデプロイを選択
3. "Promote to Production"

または CLI:
```bash
vercel rollback
```

---

詳細なインフラ設定は[ARCHITECTURE.md](../ARCHITECTURE.md)を参照してください。
