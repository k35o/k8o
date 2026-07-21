# @repo/database

k8o のデータベース関連コードをまとめたパッケージです。

このパッケージでは、主に以下を管理します。

- Drizzle ORM のスキーマ定義
- Turso / libSQL への接続
- マイグレーション
- Better Auth 用の DB スキーマ
- Storybook 向けのモック DB エクスポート

## ディレクトリ構成

変化しやすいテーブル一覧ではなく、責務単位で構成を把握できるようにしています。

```txt
packages/database/
├── src/
│   ├── db.ts           # アプリケーション用の DB エクスポート
│   ├── auth.ts         # Better Auth 関連のエクスポート
│   ├── utils.ts        # DB 操作の補助ユーティリティ
│   ├── schema/         # Drizzle のスキーマ定義
│   └── __mocks__/      # Storybook / テスト向けのモック実装
├── migrations/         # drizzle-kit が生成するマイグレーション
├── drizzle.config.ts   # drizzle-kit 設定
└── package.json
```

## エクスポート

- `@repo/database`
  - 通常実行時は `src/db.ts`
  - `storybook` 条件では `src/__mocks__/db.ts`
- `@repo/database/auth`
  - Better Auth 用のエクスポート

詳細は [`package.json`](./package.json) を参照してください。

## 主要コマンド

リポジトリルートで実行します。

```bash
pnpm run -F @repo/database dev
pnpm run -F @repo/database generate
pnpm run -F @repo/database generate:custom
pnpm run -F @repo/database migrate
pnpm run -F @repo/database studio
pnpm run -F @repo/database export:schema
pnpm run -F @repo/database build:erd
```

## ER 図

`src/schema` から `pnpm run -F @repo/database build:erd` で自動生成しています（手書きではありません）。

<!-- ERD:START -->
<!-- 自動生成: `pnpm build:erd` で再生成。手で編集しない。 -->

```mermaid
erDiagram
  account {
    text id PK
    text account_id
    text provider_id
    text user_id FK
    text access_token
    text refresh_token
    text id_token
    integer access_token_expires_at
    integer refresh_token_expires_at
    text scope
    text password
    integer created_at
    integer updated_at
  }
  ai_project_versions {
    integer id PK
    integer project_id FK
    integer parent_id
    text content
    text created_at
  }
  ai_projects {
    integer id PK
    text app
    text user_id FK
    text title
    text slug UK
    text visibility
    integer fork_of
    integer published_version_id
    text public_snapshot
    text created_at
    text updated_at
  }
  ai_share_serves {
    integer id PK
    text app
    text slug
    text created_at
  }
  ai_usages {
    integer id PK
    text app
    text user_id FK
    text kind
    integer input_tokens
    integer output_tokens
    text created_at
  }
  article_sources {
    integer id PK
    text title
    text url UK
    text site_url
    text type
    text created_at
    text updated_at
  }
  articles {
    integer id PK
    integer article_source_id FK
    text title
    text url UK
    text published_at
    text image_url
    text description
    text summary
    integer summary_attempts
    text created_at
    text updated_at
  }
  baseline_snapshots {
    integer id PK
    text feature_id UK
    text name
    text status
    text date
    text created_at
    text updated_at
  }
  blog_comment {
    integer blog_id FK
    integer comment_id FK
  }
  blog_tag {
    integer blog_id FK
    integer tag_id FK
  }
  blog_view_dailies {
    integer blog_id PK,FK
    text date PK
    integer views
  }
  blog_views {
    integer blog_id PK,FK
    integer views
  }
  blogs {
    integer id PK
    text slug UK
    integer published
    text created_at
  }
  comments {
    integer id PK
    text message
    text sent_at
    integer feedback_id FK
    text created_at
    text updated_at
  }
  feedbacks {
    integer id PK
    text name
  }
  push_logs {
    integer id PK
    text kind
    text title
    text body
    text url
    text dedupe_key UK
    integer succeeded
    integer failed
    text sent_at
  }
  push_subscriptions {
    integer id PK
    text endpoint UK
    text p256dh
    text auth
    text endpoint_host
    text created_at
    text updated_at
  }
  reporting_reports {
    integer id PK
    text type
    text url
    text body
    text created_at
  }
  session {
    text id PK
    integer expires_at
    text token UK
    integer created_at
    integer updated_at
    text ip_address
    text user_agent
    text user_id FK
  }
  slide_tag {
    integer slide_id FK
    integer tag_id FK
  }
  slides {
    integer id PK
    text slug UK
    integer published
    text created_at
  }
  tags {
    integer id PK
    text name UK
  }
  talk_tag {
    integer talk_id FK
    integer tag_id FK
  }
  talks {
    integer id PK
    text title
    text event_url
    text event_name
    text event_date
    text event_location
    text slide_url
    integer blog_id FK
  }
  user {
    text id PK
    text name
    text email UK
    integer email_verified
    text image
    integer created_at
    integer updated_at
  }
  verification {
    text id PK
    text identifier
    text value
    integer expires_at
    integer created_at
    integer updated_at
  }
  ai_projects ||--o{ ai_project_versions : "project_id"
  article_sources ||--o{ articles : "article_source_id"
  blogs ||--o{ blog_comment : "blog_id"
  blogs ||--o{ blog_tag : "blog_id"
  blogs ||--o{ blog_view_dailies : "blog_id"
  blogs ||--o{ blog_views : "blog_id"
  blogs ||--o{ talks : "blog_id"
  comments ||--o{ blog_comment : "comment_id"
  feedbacks |o--o{ comments : "feedback_id"
  slides ||--o{ slide_tag : "slide_id"
  tags ||--o{ blog_tag : "tag_id"
  tags ||--o{ slide_tag : "tag_id"
  tags ||--o{ talk_tag : "tag_id"
  talks ||--o{ talk_tag : "talk_id"
  user ||--o{ account : "user_id"
  user ||--o{ ai_projects : "user_id"
  user ||--o{ ai_usages : "user_id"
  user ||--o{ session : "user_id"
```
<!-- ERD:END -->

## 運用方針

- スキーマ変更は `src/schema/` を更新し、必要に応じてマイグレーションを生成します。
- テーブル定義やカラム一覧を README に手書きしません。下の ER 図セクションは `build:erd` による自動生成で、マーカー間を直接編集しません。
- 現在の正確な構造は `src/schema/` と `migrations/` を一次情報とします。
- スキーマを変更したら `pnpm run -F @repo/database build:erd` で README の ER 図を更新します。
