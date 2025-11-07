# Deployment Guide

このドキュメントは、k8oプロジェクトのデプロイメント手順とインフラ構成を説明します。

## 目次

- [デプロイメント概要](#デプロイメント概要)
- [本番環境](#本番環境)
- [Vercelへのデプロイ](#vercelへのデプロイ)
- [データベース (Neon)](#データベース-neon)
- [KVストア (Upstash Redis)](#kvストア-upstash-redis)
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
         ├─────────┐
         │         │
┌────────▼─────┐ ┌▼──────────────┐
│     Neon     │ │    Upstash    │
│  PostgreSQL  │ │     Redis     │
└──────────────┘ └───────────────┘
         │         │
         ├─────────┴──────────┐
         │                    │
┌────────▼─────┐    ┌────────▼───────┐
│   MicroCMS   │    │    Resend      │
│     (CMS)    │    │    (Email)     │
└──────────────┘    └────────────────┘
```

## 本番環境

### サービス一覧

| サービス | 用途 | URL |
|---------|------|-----|
| Vercel | ホスティング | https://vercel.com/k35o/k8o |
| Neon | PostgreSQL | https://console.neon.tech/app/projects/cool-king-69719941 |
| Upstash | Redis | https://console.upstash.com/vercel/kv/6ae3d043-1c14-4a5e-b4e2-18872bbd81bb |
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
- Root Directory: `./core`

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
# Database
POSTGRES_URL="postgresql://..."

# KV Store
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# CMS
MICROCMS_API_ENDPOINT="https://k35o.microcms.io/api/v1"
MICROCMS_API_KEY="..."

# Email
RESEND_API_KEY="..."

# Analytics
GOOGLE_ANALYTICS_ID="G-..."

# Admin
ADMIN_ALLOWED_IPS="xxx.xxx.xxx.xxx,yyy.yyy.yyy.yyy"

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
// vercel.json
{
  "crons": [
    {
      "path": "/api/crons/weekly-notifications",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/crons/upstash-keepalive",
      "schedule": "*/5 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## データベース (Neon)

### セットアップ

1. **プロジェクト作成**

Neon Console:
- Create Project
- プロジェクト名: `k8o`
- Region: `AWS ap-northeast-1` (Tokyo)
- PostgreSQL version: `18`

2. **接続文字列の取得**

```bash
POSTGRES_URL="postgresql://username:password@ep-xxx.ap-northeast-1.aws.neon.tech/main?sslmode=require"
```

3. **マイグレーション実行**

```bash
# ローカルで接続文字列を設定
export POSTGRES_URL="postgresql://..."

# マイグレーション実行
pnpm run -F core migrate
```

### Neon Proxy (ローカル開発)

WebSocketプロキシを使用してローカルからNeonに接続：

```bash
# docker-compose.ymlに含まれている
services:
  neon-proxy:
    image: ghcr.io/neondatabase/wsproxy:latest
    ports:
      - "5433:80"
```

### バックアップ戦略

Neonは自動バックアップを提供：
- Point-in-time recovery (PITR): 7日間
- 毎日の自動スナップショット
- マニュアルスナップショットも可能

## KVストア (Upstash Redis)

### セットアップ

1. **データベース作成**

Upstash Console:
- Create Database
- Name: `k8o-redis`
- Type: `Regional`
- Region: `ap-northeast-1` (Tokyo)
- TLS: 有効

2. **REST API設定**

```bash
KV_REST_API_URL="https://xxx.upstash.io"
KV_REST_API_TOKEN="..."
```

### 使用用途

- レート制限
- セッションキャッシュ
- ブログビューカウントキャッシュ
- 一時データストレージ

### ローカル開発

Dockerで互換サーバーを起動：

```yaml
services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  serverless-redis-http:
    image: hiett/serverless-redis-http:latest
    ports:
      - "8079:80"
    environment:
      SRH_CONNECTION_STRING: "redis://redis:6379"
```

## CMS (MicroCMS)

### セットアップ

1. **API作成**

MicroCMS ダッシュボード:
- サービス名: `k35o`
- API: `news`
- スキーマ:
  ```json
  {
    "title": "テキストフィールド",
    "content": "リッチエディタ",
    "publishedAt": "日時"
  }
  ```

2. **APIキー取得**

```bash
MICROCMS_API_ENDPOINT="https://k35o.microcms.io/api/v1"
MICROCMS_API_KEY="..."
```

### 下書きプレビュー

```typescript
// core/src/app/api/draft-news/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const draftKey = searchParams.get('draft-key');

  if (secret !== process.env.MICROCMS_API_KEY) {
    return new Response('Invalid token', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/news?draftKey=${draftKey}`);
}
```

MicroCMSの下書きプレビューURL設定：
```
https://k8o.dev/api/draft-news?secret={API_KEY}&draft-key={CONTENT_ID}
```

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
pnpm run -F core email

# http://localhost:3333 でプレビュー
```

テンプレート例：
```tsx
// core/src/emails/verification-email.tsx
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
# Database
POSTGRES_URL="postgresql://..."

# KV Store
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# CMS
MICROCMS_API_ENDPOINT="https://k35o.microcms.io/api/v1"
MICROCMS_API_KEY="..."

# Email
RESEND_API_KEY="re_..."
```

### オプション環境変数

```bash
# Analytics
GOOGLE_ANALYTICS_ID="G-..."

# Admin
ADMIN_ALLOWED_IPS="xxx.xxx.xxx.xxx,yyy.yyy.yyy.yyy"

# Deployment
VERCEL_URL="k8o.dev" # Vercelが自動設定
```

### 環境別設定

| 環境 | ファイル | 用途 |
|-----|---------|------|
| ローカル | `core/.env.local` | 開発環境 |
| Vercel Preview | Vercel Dashboard | プレビューデプロイ |
| Vercel Production | Vercel Dashboard | 本番環境 |

### セキュアな管理

```bash
# 環境変数の暗号化（推奨）
vercel env pull .env.production
vercel env add RESEND_API_KEY production

# .env.localをgitignoreに追加済み
echo "core/.env.local" >> .gitignore
```

## Cronジョブ

### 設定

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/crons/weekly-notifications",
      "schedule": "0 9 * * 1"
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
- `0 9 * * 1` - 毎週月曜日 9:00 UTC (18:00 JST)
- `*/5 * * * *` - 5分ごと
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
// core/src/app/layout.tsx
import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>{children}</body>
      <GoogleTagManager gtmId={process.env.GOOGLE_ANALYTICS_ID!} />
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
echo $POSTGRES_URL

# Neonダッシュボードで接続状態を確認
# Connection Poolingが有効か確認
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
