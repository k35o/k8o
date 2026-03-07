# よんでるものページ設計

## URL・タイトル設計

| 項目 | 値 |
|------|-----|
| **URL** | `/reading-list` |
| **タイトル** | `よんでるもの` |
| **説明** | 普段読んでいる記事をまとめたページ |
| **トップページでの配置** | Forgeセクション（Blog, Talks, Playgrounds, OSSと並列） |
| **トップページ説明文** | 「普段読んでいる記事のまとめ。」 |

### URL候補の検討

| 候補 | 判定 | 理由 |
|------|------|------|
| `/reading-list` | ✅ 採用 | 意味が明確。既存の英語URL命名と統一 |
| `/feeds` | ❌ | RSS技術寄りすぎる |
| `/reads` | ❌ | 短いが意味が曖昧 |
| `/bookshelf` | ❌ | 書籍寄りのニュアンス |

---

## 大雑把な仕様

### 1. データソース

- **RSS / Atom / 手動追加**など複数の方法で記事情報をDBに保存
- ソースの種類（type）で取得方法を切り替え

### 2. データモデル（概要）

```
article_sources（記事ソース）
├── id
├── title        -- ソース名（例: "web.dev", "Zenn"）
├── url          -- 取得元URL（RSSフィードURL、サイトURLなど）
├── site_url     -- サイトのトップURL
├── type         -- ソース種別（"rss" | "atom" | "manual"）
├── created_at
└── updated_at

articles（記事）
├── id
├── article_source_id  -- FK → article_sources
├── title              -- 記事タイトル
├── url                -- 記事URL
├── published_at       -- 記事の公開日時
└── created_at         -- 取得日時
```

### 3. 記事取得の仕組み

- **Cron Job / Webhook**で定期取得（例: Vercel Cron）
- Next.js Route Handler でcron実行
- ソースの `type` に応じて取得処理を分岐（RSS/Atom パース等）
- `type: "manual"` の場合は手動でDBに追加
- 取得時に既存記事と重複チェック（URLベース）
- 新しい記事のみDBに追加

### 4. ページUI

- **記事一覧**: 新しい順にカード形式で表示
- **ソース元でフィルタ**: サイドバーまたはタブで絞り込み
- **日付グルーピング**: 「今日」「今週」「今月」などで視覚的に区切る
- **ページネーション**: 大量の記事に対応（無限スクロールまたはページ分割）
- Server Component中心、フィルタ部分のみClient Component

### 5. 段階的な実装計画

| Phase | 内容 |
|-------|------|
| **Phase 1** | DBスキーマ作成、ソース手動管理、記事取得API、一覧表示ページ |
| **Phase 2** | フィルタリング、日付グルーピング、ページネーション |
| **Phase 3** | Vercel Cronによる自動取得、ソース管理UI（任意） |

---

## 既存サイトとの整合性

- **配置**: トップページForgeセクションにカード追加（Blog, Talks等と同列）
- **ルーティング**: `/reading-list/page.tsx` をApp Routerで作成
- **スタイル**: ArteOdysseyカスタムトークン使用（`text-fg-base`, `bg-bg-base`等）
- **データ**: `packages/database/` にスキーマ追加、既存パターンに準拠
- **メタデータ**: `generateMetadata()` でOGP設定
