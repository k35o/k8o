# Database Documentation

このディレクトリは、k8oプロジェクトのデータベーススキーマと操作を管理しています。

## 目次

- [ER図](#er図)
- [スキーマ構成](#スキーマ構成)
- [テーブル一覧](#テーブル一覧)
- [マイグレーション](#マイグレーション)
- [データベース操作](#データベース操作)

## ER図

[ER図はこちら](https://k35o.github.io/k8o)

※このER図はmainブランチにpushされるたびに自動で更新されます。

## スキーマ構成

データベーススキーマは機能ごとに分割されています：

```
schema/
├── blogs.ts              # ブログ記事
├── blog-tag.ts          # ブログとタグの関連
├── blog-views.ts        # ブログ閲覧数
├── blog-comment.ts      # ブログコメント
├── comments.ts          # コメント本体
├── talks.ts             # 登壇情報
├── talk-tag.ts          # トークとタグの関連
├── services.ts          # サービス情報
├── service-tag.ts       # サービスとタグの関連
├── service-type.ts      # サービスタイプ
├── quizzes.ts           # クイズ
├── quiz-questions.ts    # クイズ問題
├── quiz-answers.ts      # クイズ回答
├── quiz-type.ts         # クイズタイプ
├── tags.ts              # タグ
├── subscribers.ts       # メール購読者
├── feedback.ts          # フィードバック
└── index.ts             # スキーマエクスポート
```

## テーブル一覧

### コンテンツ管理

#### blogs
ブログ記事の基本情報

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| title | TEXT | 記事タイトル |
| slug | TEXT | URLスラッグ（一意） |
| description | TEXT | 記事概要 |
| content | TEXT | MDX内容 |
| publishedAt | TIMESTAMP | 公開日時 |
| updatedAt | TIMESTAMP | 更新日時 |
| createdAt | TIMESTAMP | 作成日時 |

#### talks
登壇情報

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| title | TEXT | タイトル |
| event | TEXT | イベント名 |
| date | DATE | 開催日 |
| url | TEXT | スライドURL |
| description | TEXT | 説明 |

#### services
提供サービス

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| name | TEXT | サービス名 |
| description | TEXT | 説明 |
| url | TEXT | URL |
| typeId | UUID | サービスタイプID（外部キー） |

#### quizzes
クイズ

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| title | TEXT | クイズタイトル |
| description | TEXT | 説明 |
| typeId | UUID | クイズタイプID（外部キー） |

### ユーザーデータ

#### comments
コメント

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| author | TEXT | 投稿者名 |
| email | TEXT | メールアドレス |
| content | TEXT | コメント内容 |
| createdAt | TIMESTAMP | 投稿日時 |
| blogId | UUID | ブログID（外部キー） |

#### subscribers
メール購読者

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| email | TEXT | メールアドレス（一意） |
| verified | BOOLEAN | 認証済みフラグ |
| token | TEXT | 認証トークン（nullable） |
| tokenExpiresAt | TIMESTAMP | トークン有効期限 |
| createdAt | TIMESTAMP | 登録日時 |

#### feedback
フィードバック

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| content | TEXT | フィードバック内容 |
| email | TEXT | メールアドレス（optional） |
| createdAt | TIMESTAMP | 送信日時 |

### ビュー・統計

#### blog-views
ブログ閲覧数

| カラム | 型 | 説明 |
|--------|-----|------|
| blogId | UUID | ブログID（主キー、外部キー） |
| viewCount | INTEGER | 閲覧数 |

#### quiz-answers
クイズ回答

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| quizId | UUID | クイズID（外部キー） |
| questionId | UUID | 問題ID（外部キー） |
| answer | TEXT | 回答 |
| isCorrect | BOOLEAN | 正解フラグ |
| createdAt | TIMESTAMP | 回答日時 |

### タグシステム

#### tags
タグマスタ

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| name | TEXT | タグ名（一意） |
| slug | TEXT | URLスラッグ（一意） |
| description | TEXT | 説明 |

#### blog-tag, talk-tag, service-tag
コンテンツとタグの関連テーブル（多対多）

| カラム | 型 | 説明 |
|--------|-----|------|
| blogId/talkId/serviceId | UUID | コンテンツID（外部キー） |
| tagId | UUID | タグID（外部キー） |

### マスタデータ

#### quiz-type
クイズタイプ

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| name | TEXT | タイプ名 |
| slug | TEXT | URLスラッグ |

#### service-type
サービスタイプ

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| name | TEXT | タイプ名 |
| slug | TEXT | URLスラッグ |

## マイグレーション

### マイグレーションファイルの生成

```bash
# スキーマから自動生成
pnpm run -F core generate

# カスタムマイグレーション
pnpm run -F core generate:custom
```

### マイグレーションの実行

```bash
# 本番環境
pnpm run -F core migrate

# ローカル環境
# 1. Dockerサービスを起動
docker compose up -d

# 2. マイグレーション実行
pnpm run -F core migrate
```

### スキーマのエクスポート

```bash
# SQLファイルにエクスポート
pnpm run -F core export:schema

# ERD（Entity Relationship Diagram）の生成
pnpm run -F core build:erd
```

## データベース操作

### 接続

```typescript
// core/src/database/db.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = drizzle(pool);
```

### クエリ例

#### SELECT

```typescript
import { db } from '@/database/db';
import { blogs } from '@/database/schema';
import { eq } from 'drizzle-orm';

// すべてのブログを取得
const allBlogs = await db.select().from(blogs);

// 特定のブログを取得
const blog = await db
  .select()
  .from(blogs)
  .where(eq(blogs.slug, 'my-blog'))
  .limit(1);
```

#### INSERT

```typescript
await db.insert(blogs).values({
  id: crypto.randomUUID(),
  title: 'New Blog Post',
  slug: 'new-blog-post',
  content: 'Content here...',
  publishedAt: new Date(),
});
```

#### UPDATE

```typescript
await db
  .update(blogs)
  .set({ title: 'Updated Title' })
  .where(eq(blogs.id, blogId));
```

#### DELETE

```typescript
await db
  .delete(blogs)
  .where(eq(blogs.id, blogId));
```

#### JOIN

```typescript
// ブログとタグを結合
const blogsWithTags = await db
  .select({
    blog: blogs,
    tag: tags,
  })
  .from(blogs)
  .leftJoin(blogTag, eq(blogs.id, blogTag.blogId))
  .leftJoin(tags, eq(blogTag.tagId, tags.id));
```

### トランザクション

```typescript
await db.transaction(async (tx) => {
  // 複数の操作を1つのトランザクションで実行
  const blog = await tx.insert(blogs).values({ ... }).returning();
  await tx.insert(blogTag).values({
    blogId: blog[0].id,
    tagId: 'tag-uuid',
  });
});
```

## ベストプラクティス

### 1. インデックスの活用

頻繁にクエリするカラムにはインデックスを設定：

```typescript
export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey(),
  slug: text('slug').notNull().unique(), // 自動的にインデックス
}, (table) => ({
  slugIdx: index('blog_slug_idx').on(table.slug),
}));
```

### 2. NULL制約の適切な使用

```typescript
// NOT NULL: 必須フィールド
title: text('title').notNull(),

// NULL許可: オプションフィールド
description: text('description'),
```

### 3. 外部キー制約

データ整合性を保つために外部キー制約を使用：

```typescript
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey(),
  blogId: uuid('blog_id')
    .notNull()
    .references(() => blogs.id, { onDelete: 'cascade' }),
});
```

### 4. デフォルト値の設定

```typescript
createdAt: timestamp('created_at').defaultNow().notNull(),
viewCount: integer('view_count').default(0).notNull(),
```

## パフォーマンス最適化

### Connection Pooling

```typescript
// Neon connection pooling
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 10, // 最大接続数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

### クエリの最適化

```typescript
// Bad: N+1問題
const blogs = await db.select().from(blogs);
for (const blog of blogs) {
  const tags = await db.select().from(blogTag).where(eq(blogTag.blogId, blog.id));
}

// Good: JOINで一度に取得
const blogsWithTags = await db
  .select()
  .from(blogs)
  .leftJoin(blogTag, eq(blogs.id, blogTag.blogId))
  .leftJoin(tags, eq(blogTag.tagId, tags.id));
```

## バックアップ

### 自動バックアップ（Neon）

- Point-in-time recovery (PITR): 7日間
- 毎日の自動スナップショット

### 手動バックアップ

```bash
# PostgreSQLダンプ
pg_dump $POSTGRES_URL > backup.sql

# リストア
psql $POSTGRES_URL < backup.sql
```

---

詳細なスキーマ定義は各ファイル（`schema/*.ts`）を参照してください。
