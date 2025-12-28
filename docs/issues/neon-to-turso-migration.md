# feat(database): NeonからTursoへのデータベース移行

## 概要

現在使用しているNeon PostgreSQLからTurso（libSQL/SQLite）へデータベースを移行する。

## 背景・動機

- Tursoはエッジ対応でグローバルなレイテンシ改善が期待できる
- SQLiteベースのシンプルな構成
- コスト効率の改善

## 現在の構成

- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM (`drizzle-orm/neon-serverless`)
- **Driver**: `@neondatabase/serverless`
- **スキーマ**: 18テーブル（58マイグレーション）

### 主要テーブル

| カテゴリ | テーブル |
|---------|---------|
| コンテンツ | blogs, talks, services, quizzes |
| ユーザーデータ | comments, feedback, subscribers |
| ビュー・統計 | blog_views, quiz_answers |
| クイズ関連 | quiz_questions, quiz_type |
| 関連テーブル | blog_tag, talk_tag, service_tag, blog_comment |
| マスタ | tags, service_type |

## 移行プラン

### Phase 1: 準備・調査

- [ ] Tursoアカウント作成・データベース作成
- [ ] libSQLとDrizzle ORMの互換性確認
- [ ] PostgreSQL固有機能の洗い出し（型、関数など）

### Phase 2: スキーマ変換

- [ ] Drizzle設定の更新 (`drizzle.config.ts`)
  - `dialect: 'postgresql'` → `dialect: 'turso'`
- [ ] ドライバ変更
  - `@neondatabase/serverless` → `@libsql/client`
  - `drizzle-orm/neon-serverless` → `drizzle-orm/libsql`
- [ ] スキーマファイルの変換 (`packages/database/src/schema/`)
  - `serial` → `integer` + `autoIncrement`
  - `timestamp` → `text` または `integer`（Unix timestamp）
  - PostgreSQL固有型の対応

### Phase 3: 接続設定の更新

- [ ] `packages/database/src/db.ts` の書き換え
  ```typescript
  // Before
  import { Pool, neonConfig } from '@neondatabase/serverless';
  import { drizzle } from 'drizzle-orm/neon-serverless';

  // After
  import { createClient } from '@libsql/client';
  import { drizzle } from 'drizzle-orm/libsql';
  ```
- [ ] 環境変数の変更
  - `POSTGRES_URL` → `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`

### Phase 4: マイグレーション

- [ ] 新規マイグレーションの生成（SQLite用）
- [ ] 既存58マイグレーションの整理（履歴として保持 or アーカイブ）
- [ ] マイグレーションスクリプトの動作確認

### Phase 5: データ移行

- [ ] データ移行スクリプトの作成
  - Neonからデータエクスポート（pg_dump または SELECT）
  - Tursoへデータインポート
- [ ] データ整合性の検証
- [ ] 型変換の対応（timestamp → text/integer）

### Phase 6: アプリケーション対応

- [ ] `package.json` 依存関係の更新
  ```json
  // Remove
  "@neondatabase/serverless": "1.0.2",
  "ws": "8.18.3"

  // Add
  "@libsql/client": "^0.x.x"
  ```
- [ ] Mock設定の更新 (`__mocks__/db.ts`)
- [ ] 全DBクエリの動作確認
- [ ] ローカル開発環境の設定更新

### Phase 7: インフラ・デプロイ

- [ ] Vercel環境変数の設定
  - `TURSO_DATABASE_URL`
  - `TURSO_AUTH_TOKEN`
- [ ] `CLAUDE.md` のドキュメント更新
- [ ] Docker Compose設定の更新（ローカル開発用）

### Phase 8: テスト・検証

- [ ] 全テストの実行 (`pnpm run test`)
- [ ] Storybook動作確認 (`pnpm run -F main storybook`)
- [ ] E2Eテスト（手動 or 自動）
- [ ] 本番デプロイ・動作確認

### Phase 9: クリーンアップ

- [ ] 旧Neonデータベースのバックアップ
- [ ] 不要なPostgreSQL関連コードの削除
- [ ] 古いマイグレーションファイルのアーカイブ

## 注意点・リスク

### 型の変換

| PostgreSQL | SQLite/Turso |
|------------|--------------|
| `serial` | `integer` + `autoIncrement` |
| `timestamp with timezone` | `text` (ISO8601) または `integer` (Unix) |
| `boolean` | `integer` (0/1) |

### 機能の違い

- **トランザクション**: Tursoは組み込みレプリケーションサポート
- **インデックス**: SQLiteのインデックス制約確認
- **外部キー**: SQLiteでは明示的に有効化が必要

### 既存データ

- 58個のマイグレーション履歴の扱い
- 本番データの完全バックアップ必須
- ダウンタイムの最小化計画

## 参考リンク

- [Turso Documentation](https://docs.turso.tech/)
- [Drizzle ORM - Turso](https://orm.drizzle.team/docs/get-started/turso-new)
- [@libsql/client](https://github.com/tursodatabase/libsql-client-ts)

## 完了条件

- [ ] 全テーブルがTursoに移行完了
- [ ] 全データが正常に移行完了
- [ ] アプリケーションが正常動作
- [ ] 本番環境でのパフォーマンス確認
- [ ] ドキュメントの更新完了

---

**影響範囲**: `packages/database/`, `apps/main/`, 本番環境
**優先度**: 中
**見積もり作業量**: 大
