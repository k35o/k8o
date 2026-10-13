# @repo/database

k8o の DB（api が持ち主）のコードをまとめたパッケージです。認証と ai のテーブルは ai の DB（`@repo/ai-database`）にあります。

このパッケージでは、主に以下を管理します。

- Drizzle ORM のスキーマ定義
- Turso / libSQL への接続
- マイグレーション
- Storybook 向けのモック DB エクスポート

## ディレクトリ構成

変化しやすいテーブル一覧ではなく、責務単位で構成を把握できるようにしています。

```txt
packages/database/
├── src/
│   ├── db.ts           # アプリケーション用の DB エクスポート
│   ├── orm.ts          # drizzle-orm の再エクスポート
│   ├── utils.ts        # DB 操作の補助ユーティリティ
│   ├── schema/         # Drizzle のスキーマ定義
│   └── __mocks__/      # Storybook / テスト向けのモック実装
├── migrations/         # drizzle-kit が生成するマイグレーション
├── scripts/            # ローカル DB の起動と ER 図の生成
├── drizzle.config.ts   # drizzle-kit 設定
└── package.json
```

## エクスポート

- `@repo/database`
  - 通常実行時は `src/db.ts`
  - `storybook` 条件では `src/__mocks__/db.ts`
- `@repo/database/orm`
  - `src/orm.ts`（drizzle-orm の再エクスポート）
- `@repo/database/schema`
  - `src/schema/public.ts`（DB クライアントに依存しない型と定数）

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
  browser_support_datasets {
    integer id PK
    text upstream_version UK
    text state
    text data
    text ingested_at
  }
  browser_support_feature_changes {
    integer id PK
    text feature_id
    text feature_name
    text status
    text previous_status
    text upstream_version
    text changed_at
  }
  browser_support_sync_runs {
    integer id PK
    text trigger
    text result
    text upstream_version
    text detail
    integer duration_ms
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
```
<!-- ERD:END -->

## 運用方針

- スキーマ変更は `src/schema/` を更新し、必要に応じてマイグレーションを生成します。
- テーブル定義やカラム一覧を README に手書きしません。上の ER 図セクションは `build:erd` による自動生成で、マーカー間を直接編集しません。
- 現在の正確な構造は `src/schema/` と `migrations/` を一次情報とします。
- スキーマを変更したら `pnpm run -F @repo/database build:erd` で README の ER 図を更新します。
