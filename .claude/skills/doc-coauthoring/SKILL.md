---
name: doc-coauthoring
description: ドキュメント共同執筆ワークフロー。提案書、技術仕様書、設計ドキュメントなどを3段階プロセス（コンテキスト収集→洗練・構造化→読者テスト）で作成。高品質なドキュメントを効率的に共同執筆する際に使用。
---

# ドキュメント共同執筆スキル

このスキルは、ドキュメント、提案書、技術仕様書などを高品質に作成するための構造化されたワークフローを提供する。

## 使用タイミング

以下のような場面でこのワークフローを提案する：

- 設計ドキュメントの作成
- 技術仕様書の作成
- 提案書・企画書の作成
- 意思決定文書の作成
- READMEやガイドの作成
- ブログ記事の下書き

## 3段階ワークフロー

### ステージ1: コンテキスト収集

**目的**: ユーザーが知っていることとClaudeが知っていることのギャップを埋める

#### 収集する情報

| カテゴリ | 質問例 |
|---------|--------|
| 目的 | このドキュメントで何を達成したい？ |
| 読者 | 誰が読む？技術レベルは？ |
| 背景 | なぜこのドキュメントが必要？ |
| 制約 | 期限、フォーマット、長さの制約は？ |
| 既存資料 | 参考にできる資料やテンプレートはある？ |
| 成功基準 | 何をもって「良いドキュメント」とする？ |

#### 実践方法

1. **オープンな質問から開始**
   ```
   「このドキュメントについて、持っている情報をすべて教えてください」
   ```

2. **明確化の質問**
   - 曖昧な点を具体化
   - 前提条件を確認
   - 優先順位を把握

3. **十分な理解を確認**
   - 収集した情報を要約して確認
   - 不足している情報がないかチェック

### ステージ2: 洗練と構造化

**目的**: セクションごとにドキュメントを構築し、品質を高める

#### プロセス

```
各セクションについて:
1. 明確化質問 → 何を書くべきか確認
2. ブレインストーミング → 5〜20のオプションを生成
3. キュレーション → 最適な選択肢を選定
4. ギャップチェック → 不足情報を確認
5. ドラフト作成 → 実際に執筆
6. フィードバック → ユーザーの意見を反映
```

#### 推奨事項

- **未知が多いセクションから着手**: 不確実性を早期に解消
- **外科的編集を心がける**: 全体を再印刷せず、必要な部分のみ修正
- **選択肢を提示**: 判断が必要な箇所は複数案を示す

#### セクション構築の例

```markdown
## [セクション名] について

### 質問
- このセクションで最も伝えたいことは？
- 読者がここで知りたいことは？

### オプション（5案）
1. [アプローチA]: 技術的な詳細から入る
2. [アプローチB]: ユースケースから入る
3. [アプローチC]: 問題提起から入る
4. [アプローチD]: 結論ファーストで進める
5. [アプローチE]: 比較表で示す

### 推奨
オプション4を推奨。理由: 読者の時間を尊重し、結論を先に示すことで...

どのアプローチがよいですか？
```

### ステージ3: 読者テスト

**目的**: 著者の盲点を発見し、読者にとって機能するドキュメントを確保

#### テスト方法

**方法1: サブエージェントによるシミュレーション**

新しいClaudeインスタンスに以下を依頼：
- 読者として質問を予測
- 理解度をテスト
- 曖昧な箇所を指摘

**方法2: 新しい会話でテスト**

```
「このドキュメントを、何も背景知識がない状態で読んで、
 わかりにくい点や疑問点を教えてください」
```

#### チェックリスト

- [ ] 専門用語は説明されているか
- [ ] 前提知識は明示されているか
- [ ] 論理の飛躍がないか
- [ ] 読者の「なぜ？」に答えているか
- [ ] アクションアイテムは明確か

## ユーザーエージェンシーの尊重

このワークフローは**提案**であり、強制ではない：

- ステージをスキップしてよい
- 自由形式で進めてよい
- 一部のステージだけ使ってもよい

```
「構造化されたプロセスで進めますか？
 それとも自由形式で進めますか？」
```

## 編集原則

### する

- 外科的な編集（必要な部分のみ修正）
- 選択肢の提示（複数案を示す）
- 確認してから変更
- バージョン管理の意識

### しない

- 全体を毎回再印刷
- 勝手に大幅な変更
- ユーザーの意図を無視した「改善」

## 使用例

### 例1: 技術設計書の作成

```
ユーザー: 「新しい認証システムの設計書を作りたい」

Claude: 「設計書の作成ですね。3段階のワークフローで進めましょうか？

まずコンテキストを集めさせてください：
1. この認証システムは何を解決しますか？
2. 誰がこの設計書を読みますか？（開発者、PM、セキュリティチーム等）
3. 既存の認証システムはありますか？
4. 参考にしたいテンプレートや過去の設計書はありますか？」
```

### 例2: README更新

```
ユーザー: 「READMEを更新したい」

Claude: 「READMEの更新ですね。どのような更新を考えていますか？

簡単な更新であれば直接編集できます。
大幅な改訂であれば、共同執筆ワークフローで進めることもできます。

どちらがよいですか？」
```

### 例3: ブログ記事

```
ユーザー: 「技術ブログを書きたい」

Claude: 「技術ブログですね！まず教えてください：

1. どんなトピックについて書きたいですか？
2. 想定読者は？（初心者向け、経験者向け等）
3. 伝えたいメッセージは何ですか？
4. 長さの目安は？

これらを教えてもらえれば、一緒に構成を考えていきます」
```

## このプロジェクトでの活用

k8oプロジェクトでは以下のドキュメントで活用できる：

| ドキュメント | 活用場面 |
|-------------|---------|
| `docs/API.md` | 新しいAPIエンドポイントの仕様書作成 |
| `docs/ARCHITECTURE.md` | アーキテクチャ変更の設計 |
| `CONTRIBUTING.md` | 開発ガイドラインの更新 |
| ブログ記事 | `apps/main/src/app/blog/(articles)/` 配下のMDX作成 |
| 新機能提案 | RFC・設計ドキュメントの作成 |

## k8oブログ記事の作成手順

### 1. 必要なファイル

新しいブログ記事を作成する際は、以下のファイルが必要：

```
apps/main/src/app/blog/(articles)/{slug}/
├── page.mdx              # 記事本体
├── layout.tsx            # メタデータ・レイアウト
└── opengraph-image.tsx   # OGP画像生成
```

| ファイル | 必須 |
|---------|------|
| `page.mdx` | ✅ |
| `layout.tsx` | ✅ |
| `opengraph-image.tsx` | ✅ |
| Playground (`apps/main/src/app/_components/playgrounds/{feature-name}/`) | デモがある場合 |
| マイグレーション (`packages/database/migrations/`) | ✅ |

### 2. 記事のMDX構造

```mdx
---
title: 'タイトル'
description: '説明文（SEO用、100-160文字程度）'
createdAt: 2025-01-10
updatedAt: 2025-01-10
---

import { BaselineStatus } from '@k8o/arte-odyssey/baseline-status';
import { MyDemo } from '@/app/_components/playgrounds/my-feature';
import { Playground } from '@/app/_components/playgrounds';

# タイトル

<BaselineStatus featureId="feature-id"></BaselineStatus>

## はじめに

背景・課題・新機能の紹介

## 機能の説明

コード例とPlayground

<Playground>
  <MyDemo />
</Playground>

## おわりに

まとめ
```

### 3. layout.tsx

`LayoutProps`の型パラメータには、実際のブログスラグを指定する（例: `/blog/my-article`）。

```typescript
import type { Metadata } from 'next';
import { getBlogContent } from '@/app/blog/_api';
import { BlogLayout } from '@/app/blog/_components/blog-layout';

const slug = 'my-article'; // 実際のスラグに置き換える

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlogContent(slug);

  return {
    title: blog.title,
    description: blog.description,
    category: blog.tags.map((tag) => tag.name).join(', '),
    openGraph: {
      title: blog.title,
      description: blog.description ?? undefined,
      url: `https://k8o.me/blog/${slug}`,
      publishedTime: blog.createdAt.toString(),
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: blog.title,
      card: 'summary_large_image',
      description: blog.description ?? undefined,
    },
  };
}

export default function Layout({
  children,
}: LayoutProps<'/blog/my-article'>) { // 実際のスラグに置き換える
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
```

### 4. opengraph-image.tsx

```typescript
import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = '記事タイトル';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('{slug}');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
```

### 5. Playgroundコンポーネントの作成（デモがある場合）

デモが必要な場合は以下のファイルを作成。ディレクトリ名はブログスラグと一致させる必要はなく、機能の内容がわかる名前を使用する（例: `caret-position-from-point`, `event-timing`）。

```
apps/main/src/app/_components/playgrounds/{feature-name}/
├── {feature-name}-demo.tsx           # メインコンポーネント
├── {feature-name}-demo.stories.tsx   # Storybook
└── index.ts                          # エクスポート
```

#### index.tsの例

```typescript
import type { PlaygroundSection } from '../types';
import { MyDemo } from './my-demo';

export { MyDemo } from './my-demo';

export const mySection: PlaygroundSection = {
  id: 'my-feature',
  title: 'My Feature',
  description: '機能の説明',
  type: 'blog',
  slug: 'my-feature',
  demos: [{ component: MyDemo, title: 'デモタイトル' }],
};
```

#### playgrounds/index.tsへの追加

- `export * from './{slug}';` を追加
- `import { mySection } from './{slug}';` を追加
- `playgroundSections` 配列に追加

### 6. データベースマイグレーション

```bash
pnpm run -F @repo/database generate:custom
```

生成されたSQLファイルに以下を記述：

```sql
-- 新しいタグが必要な場合
INSERT INTO tags (id, name) VALUES ({next_id}, 'タグ名');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES ({next_id}, '{slug}', 1, '{date}T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES ({blog_id}, 0);--> statement-breakpoint

-- タグ紐付け
INSERT INTO blog_tag (blog_id, tag_id) VALUES ({blog_id}, {tag_id});
```

### 7. タグの確認と追加

#### 既存タグの検索

既存のタグを確認して重複を避ける：

```bash
# 全タグを検索
grep "INSERT INTO tags" packages/database/migrations/*.sql

# 特定のタグ名で検索（例：CSS関連）
grep "INSERT INTO tags" packages/database/migrations/*.sql | grep -i "css"
```

#### 次のタグIDを取得

```bash
# 最新のタグIDを確認
grep "INSERT INTO tags" packages/database/migrations/*.sql | \
  grep -oE 'VALUES \([0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1
```

結果に+1した値が次のタグID。

#### よく使うタグID

| ID | タグ名 |
|----|--------|
| 10 | JavaScript |
| 11 | Baseline 2025 |
| 15 | HTML |
| 21 | Baseline 2024 |
| 30 | CSS |
| 90 | Performance API |
| 91 | PerformanceEventTiming |
| 92 | LCP |
| 93 | document.caretPositionFromPoint() |

タグは随時追加されるため、上記は参考程度とし、既存タグの検索コマンドで最新の状態を確認することを推奨。全タグは `packages/database/migrations/` 配下のマイグレーションファイルを参照。

#### 次のブログIDを取得

```bash
# 最新のブログIDを確認
grep "INSERT INTO blogs" packages/database/migrations/*.sql | \
  grep -oE 'VALUES \([0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1
```

### 8. チェックリスト

- [ ] `page.mdx` 作成
- [ ] `layout.tsx` 作成
- [ ] `opengraph-image.tsx` 作成
- [ ] Playgroundコンポーネント作成（必要な場合）
- [ ] Storybookストーリー作成（必要な場合）
- [ ] `playgrounds/index.ts` 更新（必要な場合）
- [ ] マイグレーションSQL作成
- [ ] `pnpm run -F @repo/database generate:custom` 実行済み

## 品質チェックリスト

最終確認として：

- [ ] 目的が冒頭で明確に述べられている
- [ ] 読者の前提知識レベルに合っている
- [ ] 構造が論理的で追いやすい
- [ ] 専門用語は初出時に説明されている
- [ ] 図表や例が適切に使われている
- [ ] アクションアイテムが明確（該当する場合）
- [ ] タイポや文法ミスがない
- [ ] リンクが有効

---

## ライセンス

このスキルは [anthropics/skills](https://github.com/anthropics/skills) の
[doc-coauthoring](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)
をベースに作成されています。

Copyright 2025 Anthropic, PBC

原作は [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) でライセンスされています。

**MODIFIED**: このファイルは原作から以下の変更を加えています：
- 日本語に翻訳
- k8oプロジェクト固有の活用例を追加
