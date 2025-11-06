# API Documentation

このドキュメントは、k8oプロジェクトで提供されるAPIエンドポイントを説明します。

## 目次

- [認証](#認証)
- [レート制限](#レート制限)
- [エンドポイント一覧](#エンドポイント一覧)
  - [ブログAPI](#ブログapi)
  - [購読API](#購読api)
  - [ニュースAPI](#ニュースapi)
  - [Cronジョブ](#cronジョブ)
- [エラーハンドリング](#エラーハンドリング)

## 認証

### Public API

以下のエンドポイントは認証不要：
- `POST /api/blog/views` - ブログビューカウント
- `GET /api/subscriptions/verify` - メール認証

### Admin API

以下のエンドポイントは認証が必要：
- `GET /api/draft-news` - ニュース下書きモード
- `POST /api/crons/*` - Cronジョブ（Vercel Cronのみ）

## レート制限

Upstash Redisを使用したレート制限を実装しています。

**制限値：**
- 購読API: 5リクエスト/分/IP
- その他のAPI: 10リクエスト/分/IP

**レート制限を超えた場合：**
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```
ステータスコード: `429 Too Many Requests`

## エンドポイント一覧

### ブログAPI

#### ブログビューカウントの増加

ブログ記事の閲覧数をインクリメントします。

```
POST /api/blog/views
```

**リクエストボディ：**
```json
{
  "slug": "string"
}
```

**パラメータ：**
| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| slug | string | ✓ | ブログ記事のスラッグ |

**レスポンス：**
```
Status: 204 No Content
```

**エラーレスポンス：**
```json
{
  "error": "Blog not found"
}
```
ステータスコード: `404 Not Found`

**使用例：**
```typescript
// クライアントサイド
const incrementView = async (slug: string) => {
  await fetch('/api/blog/views', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug }),
  });
};
```

**実装詳細：**
- Zodによるバリデーション
- Redis経由でビューカウントをキャッシュ
- PostgreSQLに永続化

---

### 購読API

#### メール認証

メールアドレスの認証を行い、購読を有効化します。

```
GET /api/subscriptions/verify?email={email}&token={token}
```

**クエリパラメータ：**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| email | string | ✓ | URLエンコードされたメールアドレス |
| token | string | ✓ | 認証トークン（UUID v4） |

**レスポンス：**

成功時：
```
Redirect to: /subscriptions?status=true
```

失敗時：
```
Redirect to: /subscriptions?status=false&message={errorMessage}
```

**エラーメッセージ：**
- `トークンが無効です` - トークンが存在しないまたは期限切れ
- `既に認証済みです` - すでに認証済みのメールアドレス
- `予期しないエラーが発生しました` - その他のエラー

**使用例：**

ユーザーはメールのリンクをクリック：
```
https://k8o.dev/api/subscriptions/verify?email=user%40example.com&token=123e4567-e89b-12d3-a456-426614174000
```

**実装詳細：**
- トークンの有効期限: 24時間
- 認証後はトークンを削除
- 認証済みフラグを更新

---

### ニュースAPI

#### ニュース下書きモード

MicroCMSの下書きプレビューモードを有効化します。

```
GET /api/draft-news?secret={apiKey}&draft-key={draftKey}
```

**クエリパラメータ：**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| secret | string | ✓ | MicroCMS API Key |
| draft-key | string | ✓ | 下書きキー |

**レスポンス：**

成功時：
```
Redirect to: /news?draftKey={draftKey}
```

失敗時：
```json
{
  "error": "Invalid token"
}
```
ステータスコード: `401 Unauthorized`

**使用例：**

MicroCMS管理画面からのリンク：
```
https://k8o.dev/api/draft-news?secret=YOUR_API_KEY&draft-key=abc123
```

**実装詳細：**
- Next.js Draft Modeを使用
- 認証はMicroCMS API Keyで行う
- 下書きモードは同一セッション内で有効

---

### Cronジョブ

#### 週次通知送信

購読者に週次メールを送信します。

```
POST /api/crons/weekly-notifications
```

**認証：**
Vercel Cronからのリクエストのみ許可

**レスポンス：**
```json
{
  "success": true,
  "sent": 42
}
```

**エラーレスポンス：**
```json
{
  "error": "Unauthorized"
}
```
ステータスコード: `401 Unauthorized`

**実行スケジュール：**
```yaml
# vercel.json
{
  "crons": [{
    "path": "/api/crons/weekly-notifications",
    "schedule": "0 9 * * 1"  # 毎週月曜日 9:00 JST
  }]
}
```

**実装詳細：**
- 認証済み購読者のみに送信
- Resend APIを使用
- 配信失敗時はログに記録

---

#### Upstash Keepalive

Upstash Redisの接続を維持します。

```
POST /api/crons/upstash-keepalive
```

**認証：**
Vercel Cronからのリクエストのみ許可

**レスポンス：**
```json
{
  "success": true,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**実行スケジュール：**
```yaml
# vercel.json
{
  "crons": [{
    "path": "/api/crons/upstash-keepalive",
    "schedule": "*/5 * * * *"  # 5分ごと
  }]
}
```

**実装詳細：**
- Redis接続のウォームアップ
- レート制限カウンターのクリーンアップ
- ヘルスチェック

---

## エラーハンドリング

### エラーレスポンスフォーマット

すべてのエラーは以下の形式で返されます：

```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTPステータスコード

| コード | 説明 | 例 |
|-------|------|-----|
| 200 | 成功 | データ取得成功 |
| 204 | 成功（レスポンスなし） | ビューカウント更新 |
| 400 | バリデーションエラー | 不正なリクエストボディ |
| 401 | 認証エラー | 無効なAPIキー |
| 404 | リソースが見つからない | 存在しないブログ記事 |
| 429 | レート制限超過 | 短時間に多数のリクエスト |
| 500 | サーバーエラー | 予期しないエラー |

### Zodバリデーションエラー

```json
{
  "error": "Validation failed",
  "issues": [
    {
      "path": ["slug"],
      "message": "Required"
    }
  ]
}
```
ステータスコード: `400 Bad Request`

### データベースエラー

```json
{
  "error": "Database error",
  "code": "DB_ERROR"
}
```
ステータスコード: `500 Internal Server Error`

## ベストプラクティス

### 1. エラーハンドリング

```typescript
const response = await fetch('/api/blog/views', {
  method: 'POST',
  body: JSON.stringify({ slug }),
});

if (!response.ok) {
  if (response.status === 429) {
    // レート制限の処理
    const retryAfter = response.headers.get('Retry-After');
    console.log(`Retry after ${retryAfter} seconds`);
  }
  throw new Error('Failed to increment view');
}
```

### 2. リトライ戦略

```typescript
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 3. タイムアウト設定

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('/api/blog/views', {
    method: 'POST',
    body: JSON.stringify({ slug }),
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeoutId);
}
```

## 開発環境

### ローカルテスト

```bash
# 開発サーバーを起動
pnpm run dev

# APIをテスト
curl -X POST http://localhost:3000/api/blog/views \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-article"}'
```

### モックデータ

開発環境ではMSWによるAPIモックが利用可能：

```typescript
// src/mocks/handlers/blog.ts
export const blogHandlers = [
  http.post('/api/blog/views', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
```

## セキュリティ

### CORS設定

```typescript
// 本番環境のみk8o.devからのリクエストを許可
const allowedOrigins = ['https://k8o.dev'];
```

### レート制限

```typescript
// Upstash Redisでレート制限
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

### 環境変数

APIに必要な環境変数：

```bash
# .env.local
POSTGRES_URL="postgres://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
MICROCMS_API_KEY="..."
RESEND_API_KEY="..."
```

---

詳細な実装は各APIルートファイル（`core/src/app/api/`）を参照してください。
