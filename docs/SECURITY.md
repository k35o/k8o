# Security Policy

このドキュメントは、k8oプロジェクトのセキュリティポリシーと脆弱性報告方法を説明します。

## 目次

- [サポートされているバージョン](#サポートされているバージョン)
- [脆弱性の報告](#脆弱性の報告)
- [セキュリティ対策](#セキュリティ対策)
- [認証と認可](#認証と認可)
- [データ保護](#データ保護)
- [セキュアコーディング](#セキュアコーディング)
- [依存関係の管理](#依存関係の管理)
- [監査ログ](#監査ログ)

## サポートされているバージョン

以下のバージョンにセキュリティアップデートを提供しています：

| バージョン | サポート状況 |
| --------- | ----------- |
| main      | ✅ サポート中 |
| 過去のバージョン | ❌ サポート終了 |

本番環境では常に最新の`main`ブランチを使用してください。

## 脆弱性の報告

### 報告方法

セキュリティ上の脆弱性を発見した場合は、**公開のIssueを作成せず**に以下の方法で報告してください：

1. **GitHubのSecurity Advisory** (推奨)
   - https://github.com/k35o/k8o/security/advisories/new
   - プライベートな報告が可能

2. **直接連絡**
   - メンテナーに直接メールで連絡
   - 詳細は`README.md`を参照

### 報告に含めるべき情報

- 脆弱性の種類（XSS、CSRF、SQLインジェクション等）
- 影響を受けるコンポーネント/ファイル
- 再現手順
- 影響範囲と深刻度の評価
- 可能であれば修正案

### 対応プロセス

1. **受領確認**: 24時間以内に報告を確認
2. **調査**: 脆弱性の検証と影響範囲の特定
3. **修正**: パッチの開発とテスト
4. **公開**: 修正後にセキュリティアドバイザリを公開
5. **フォローアップ**: 必要に応じて追加対応

## セキュリティ対策

### OWASP Top 10 対策

#### 1. インジェクション攻撃

**SQL Injection**

✅ Drizzle ORMによるプリペアドステートメント使用：

```typescript
// Good: パラメータ化されたクエリ
const blog = await db
  .select()
  .from(blogs)
  .where(eq(blogs.slug, userInput));

// Bad: 文字列結合（使用禁止）
const query = `SELECT * FROM blogs WHERE slug = '${userInput}'`;
```

**XSS (Cross-Site Scripting)**

✅ Reactの自動エスケープ機能：

```tsx
// Good: 自動エスケープ
<div>{userInput}</div>

// Bad: dangerouslySetInnerHTML（避ける）
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

✅ DOMPurifyでHTMLをサニタイズ：

```typescript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

#### 2. 認証の不備

✅ Admin APIの保護：

```typescript
// IP制限
const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
const clientIP = request.headers.get('x-forwarded-for');

if (!allowedIPs.includes(clientIP)) {
  return new Response('Unauthorized', { status: 401 });
}
```

✅ トークンベースの認証：

```typescript
// メール認証トークン（UUID v4）
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間

await db.insert(verificationTokens).values({
  email,
  token,
  expiresAt,
});
```

#### 3. 機密データの露出

✅ 環境変数の適切な管理：

```typescript
// Good: サーバーサイドのみ
import 'server-only';

const apiKey = process.env.MICROCMS_API_KEY;

// Bad: クライアントに露出（避ける）
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
```

✅ `.gitignore`で機密ファイルを除外：

```gitignore
.env.local
.env.production
*.pem
*.key
```

#### 4. XML外部エンティティ (XXE)

本プロジェクトではXMLを使用していないため、該当なし。

#### 5. アクセス制御の不備

✅ 下書きモードの認証：

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // API Keyによる認証
  if (secret !== process.env.MICROCMS_API_KEY) {
    return new Response('Invalid token', { status: 401 });
  }

  // ...
}
```

#### 6. セキュリティ設定のミス

✅ セキュリティヘッダーの設定：

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

#### 7. XSS (再掲)

上記「インジェクション攻撃」参照。

#### 8. 安全でないデシリアライゼーション

✅ Zodによるバリデーション：

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  content: z.string().max(1000),
});

// 安全なパース
const result = schema.safeParse(input);
if (!result.success) {
  return new Response('Invalid input', { status: 400 });
}
```

#### 9. 既知の脆弱性を持つコンポーネント

✅ Renovateによる自動更新：

```.github/workflows/renovate.yml
- 依存関係の自動更新
- セキュリティアラートの自動対応
```

#### 10. ログとモニタリングの不足

✅ エラーログとモニタリング：

```typescript
// サーバーサイドエラーログ
console.error('[ERROR]', {
  message: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});

// Vercel Analyticsによるモニタリング
import { Analytics } from '@vercel/analytics/react';
```

### CSRF (Cross-Site Request Forgery) 対策

✅ Next.jsのSameSite Cookie設定：

```typescript
// Next.jsが自動的にSameSite=Lax/Strictを設定
```

✅ OriginヘッダーCheck：

```typescript
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = ['https://k8o.dev'];

  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  // ...
}
```

### Content Security Policy (CSP)

```typescript
// next.config.ts
{
  headers: [
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://www.google-analytics.com",
      ].join('; '),
    },
  ],
}
```

## 認証と認可

### 現在の認証方式

| 機能 | 認証方式 |
|-----|---------|
| Admin API | IP制限 |
| メール購読 | トークンベース（UUID） |
| 下書きプレビュー | API Key |
| Cronジョブ | Vercel Cron認証 |

### 将来的な拡張

ユーザー認証機能を追加する場合の推奨：

1. **Auth.js** (NextAuth.js v5)
   - OAuth (Google, GitHub等)
   - Magic Link (パスワードレス)
   - JWT/Session管理

2. **認可モデル**
   - RBAC (Role-Based Access Control)
   - ロール: `admin`, `editor`, `viewer`

## データ保護

### 個人情報の取り扱い

**収集するデータ：**
- メールアドレス（購読者）
- IPアドレス（アクセスログ）
- ブラウザ情報（Analytics）

**保護措置：**
- データベース暗号化（Neon自動暗号化）
- TLS通信の強制
- 不要なデータの定期削除

### GDPR準拠（該当する場合）

```typescript
// データ削除API（将来実装）
export async function DELETE(request: Request) {
  const { email } = await request.json();

  // すべての個人データを削除
  await db.delete(subscribers).where(eq(subscribers.email, email));
  await db.delete(comments).where(eq(comments.email, email));

  return new Response(null, { status: 204 });
}
```

### データ保持ポリシー

| データ種類 | 保持期間 |
|-----------|---------|
| 購読者情報 | 購読解除まで |
| コメント | 無期限（削除リクエスト可能） |
| アクセスログ | 30日間 |
| エラーログ | 7日間 |

## セキュアコーディング

### 入力バリデーション

**すべての入力をバリデーション：**

```typescript
import { z } from 'zod';

// スキーマ定義
const commentSchema = z.object({
  author: z.string().min(1).max(50),
  email: z.string().email(),
  content: z.string().min(1).max(1000),
  blogId: z.string().uuid(),
});

// バリデーション
export async function POST(request: Request) {
  const body = await request.json();
  const result = commentSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const { author, email, content, blogId } = result.data;
  // ...
}
```

### 出力エンコーディング

```tsx
// HTMLエスケープ（React自動）
<div>{userInput}</div>

// URLエンコーディング
<a href={`/search?q=${encodeURIComponent(query)}`}>Search</a>

// JSONエスケープ
Response.json({ message: userInput });
```

### エラーハンドリング

```typescript
// Good: 最小限の情報のみ返す
try {
  await db.insert(blogs).values(data);
} catch (error) {
  console.error(error); // サーバーログに記録
  return Response.json(
    { error: 'Failed to create blog' },
    { status: 500 }
  );
}

// Bad: 詳細なエラーを露出（避ける）
catch (error) {
  return Response.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  );
}
```

## 依存関係の管理

### 脆弱性スキャン

```bash
# npm audit
pnpm audit

# Renovateによる自動更新
# .github/renovate.json
```

### 依存関係の最小化

- 必要な依存関係のみインストール
- `devDependencies`と`dependencies`を適切に分離
- 定期的な依存関係の見直し

### サプライチェーン攻撃対策

```bash
# lockfileの検証
pnpm install --frozen-lockfile

# パッケージの検証
pnpm verify-store-integrity
```

## 監査ログ

### ログ記録対象

- 管理者操作
- 認証試行（成功/失敗）
- データベース変更
- エラーとクラッシュ

### ログ形式

```typescript
const auditLog = {
  timestamp: new Date().toISOString(),
  level: 'INFO' | 'WARN' | 'ERROR',
  action: 'CREATE_BLOG' | 'DELETE_COMMENT' | 'LOGIN_ATTEMPT',
  userId: 'admin@k8o.dev',
  ip: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
  details: {},
};

console.log(JSON.stringify(auditLog));
```

### ログの保管

- Vercel Logs: 7日間保持
- 長期保管が必要な場合は外部サービス（Datadog、Logtail等）を検討

## セキュリティチェックリスト

開発時のチェックリスト：

- [ ] すべての入力をバリデーション（Zod）
- [ ] SQLインジェクション対策（Drizzle ORM）
- [ ] XSS対策（React自動エスケープ）
- [ ] CSRF対策（SameSite Cookie）
- [ ] 環境変数の適切な管理
- [ ] セキュリティヘッダーの設定
- [ ] HTTPS通信の強制
- [ ] 依存関係の定期更新
- [ ] エラーメッセージの最小化
- [ ] 監査ログの記録
- [ ] アクセス制御の実装

## インシデント対応

### 対応フロー

1. **検知**: モニタリングまたは報告
2. **評価**: 影響範囲と深刻度の判定
3. **封じ込め**: 攻撃の遮断
4. **調査**: 原因と被害の特定
5. **復旧**: システムの修復
6. **事後対応**: 報告と再発防止

### 緊急連絡先

- メンテナー: （詳細は`README.md`参照）
- Vercel Support: https://vercel.com/support

---

セキュリティは継続的なプロセスです。定期的にこのドキュメントを見直し、最新のベストプラクティスを反映させてください。
