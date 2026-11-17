---
name: blog-prep
description: k8o のブログ記事を新しく書き始めるときに使う。記事の決まり（検索結果での見せ方、冒頭、中身）を示す。あわせて、article.mdx の雛形と Playground のデモ、DB のマイグレーションを用意する。「ブログを書きたい」「記事の準備をして」「〇〇の記事を書く」と言われたときにも使う。本文の執筆そのものは行わない。
---

# ブログ記事準備スキル

k8o のブログ記事を公開するために必要なファイル一式を用意し、記事の決まりを示す。このスキルは本文を書かない。本文を書くときは、書くのがユーザーでも Claude でも、下の記事の決まりに従う。書き終えた記事は `/blog-review` でレビューする。

## 記事の決まり

Web 機能やライブラリ、道具の機能を紹介する記事に当てる。体験記や概念を説明する記事には当てず、日本語と構成を整えるだけにする。

読者のほぼ全員が Google 検索から来て、1本の記事に着地し、40秒ほどで離れる。機能紹介の記事は MDN や web.dev と同じ検索結果に並ぶ。そのため、検索結果で選ばれる見せ方と、読み始めてすぐ答えが分かる冒頭、MDN を読んでも得られない中身の3つを用意する。

### 検索結果での見せ方

- タイトルは、検索で打たれる綴りの機能名（`Promise.try`、`::details-content`、`field-sizing`）を先頭に置く。その後ろに、その機能で片付く作業を書く。作業は仕様の言葉ではなく、機能が無かった頃から検索されていた言葉で書く（「フォームコントロールを内容に合わせて伸縮させる」より「textareaの高さを内容に合わせる」）。「：」で2つの句をつながず、1つの句にする。検索結果で切れないよう、30字前後に収める。
- description は、最初の80字ほどで何ができるか、どんな作業に使うかを言い切る。スマホの検索結果はそこまでしか出ない。Baseline に入ったことや対応ブラウザは後ろに回し、全体を120字以内にする。

### 冒頭

- 最初の段落で、「〇〇とは」に1〜2文で答える。最初の段落は `<BrowserSupportStatus>` の直後の段落を指し、`## はじめに` から始めるならその節の最初の段落を指す。「zstandardとは」「相対輝度」のような広い検索語で来た人は、ここで読み進めるかを決める。
- 最初のコードより前に、今までの書き方を使う場面と、この機能でしかできない場面を書き分ける。書き分けは「〜なら〜で足ります」「〜に向いています」「〜だけで済みます」のような決まった言い回しにせず、「〜ときは〜を使います」「〜は〜でできます」のように言い切る。
- 最初の2節以内に、操作できるデモか、貼れば動く最小のコードを置く。`## はじめに` も1節と数える。直後に、デモなら何を押すと何が見えるかを、コードなら何が出るかを書く。保存や起動の手順は書かない。試したい読者は自分でコピーして試す。

### 中身

- 自分で動かして分かったことを1つ以上書く。ブラウザで結果が分かれるときは、ブラウザの名前を添える。MDN と並んだときに、この記事を読む理由になる。確かめたブラウザやライブラリの版は書かない。読者に要るのは、機能がどの版で入ったか（Web 機能なら `<BrowserSupportStatus>` のバーが示す）のほうで、確かめた版は書くたびに手間がかかり、すぐ古くなる。デモを作るときに見つけた落とし穴や回避策は、デモのコメントだけでなく本文にも書く。
- 冒頭や「おわりに」の節で挙げた用途ごとに、その用途のコードを載せる（textarea を用途に挙げたなら、input だけでなく textarea の例を置く）。
- 本文のコードは実際に動かして確かめる。JS は node かブラウザで、DOM や CSS の挙動は `/agent-browser` で確かめる。
- 「おわりに」の節を、本文と食い違わせない。
- Baseline に達していない Web 機能は、記事の中で紹介しない。Baseline に入ったときに、その機能だけの記事として書く題材になる。

## 必要なファイル

新しいブログ記事を公開するには、以下のファイルが必要：

```
apps/main/src/content/blog/{slug}/
├── article.mdx   # 記事本体
├── _images/      # 記事の画像（使う場合）
└── _components/  # この記事だけの部品（使う場合）
```

| ファイル | 必須 |
|---------|------|
| `article.mdx` | ✅ |
| Playground (`apps/main/src/playgrounds/{feature-name}/`) | デモがある場合 |
| マイグレーション (`packages/database/migrations/`) | ✅ |

記事のページ（`/blog/{slug}`）のレイアウトとメタデータ、OGP画像（`/blog/{slug}/og.png`）は、`apps/main/src/routes/blog/[slug]/` が全記事に共通で作る。記事ごとの route ファイルは作らない。

## ファイルテンプレート

### 1. article.mdx（雛形）

```mdx
---
title: '機能名で片付く作業'
description: '何ができるか、どんな作業に使うかを最初の80字で言い切る。全体は120字以内'
createdAt: 2025-01-10
updatedAt: 2025-01-10
featureIds:
  - feature-id
---

# 機能名で片付く作業

<BrowserSupportStatus featureId="feature-id" />

{/* 最初の段落で「機能名とは」に1〜2文で答え、今までの書き方を使う場面と、この機能でしかできない場面を書き分ける */}

## セクション

{/* 最初の2節以内に、デモか、貼れば動く最小のコードを置く。デモなら何を押すと何が見えるか、コードなら何が出るかを書く */}

<PlaygroundEmbed demo="デモタイトル" headingLevel="h4" sectionId="my-feature" />
```

- 記事で使う部品（`BrowserSupportStatus`・`PlaygroundEmbed`・`Playground`・`LinkCard`・`Image`・`FloatImage`・`Alert`）は `apps/main/src/components/blog/blog-mdx-components` の `blogMdxComponents` で渡されるので、import しない。MDX から `@/`・`next`・`next-themes` を import すると、`features/blog/application/article-files.test.ts` が落ちる。
- 記事の画像は `_images/` に、この記事だけの部品は `_components/` に置き、`./_images/...`・`./_components/...` の相対パスで import する。
- `_images/` の画像は、`pnpm run -F main optimize:image <元の画像> src/content/blog/{slug}/_images/{名前}.avif --max-width 1920` で AVIF にして置く（パスは `apps/main` からの相対か絶対パス）。元の PNG や JPG はコミットしない。出力された `width={...} height={...}` を `<Image src={...} alt="..." width={...} height={...} />` に書き、画面の最初に見える画像には `loading="eager"` を足す。`FloatImage` は表示したい大きさの width と height を、画像と同じ縦横比で書く。縦横比が画像と合わないと `features/blog/application/article-files.test.ts` が落ちる。
- `<LinkCard href="..." />` を足したら、`pnpm run -F main generate:link-card-metadata` を流し、更新された `apps/main/src/content/link-card-metadata.json` もコミットする。カードはこの JSON の OGP で描き、ビルドではリンク先へ取りに行かない。流し忘れは `features/blog/application/article-files.test.ts` が落とす。出力に「OGP が取れなかった」が出たら、時間をおいて流し直す。それでも出る URL（`http://` や OGP を持たないページ）は `{}` のままでよい。`--refresh` は使わない。
- `featureIds` には紹介する Web 機能の web-features の ID を書き、H1 の直下に同じ ID の `<BrowserSupportStatus featureId="..." />` を置く。`featureIds` に書いた機能は `/browser-support` からこの記事へリンクされる。Web 機能を紹介しない記事では、`featureIds` と `<BrowserSupportStatus>` を書かない。
- `<PlaygroundEmbed>` の `sectionId` にはセクションの `id`、`demo` にはデモの `title` を渡す（`demo` を省くとセクションの全デモが並ぶ）。Playground が無い記事では、`<PlaygroundEmbed>` を書かない。
- `<PlaygroundEmbed>` と `<Playground>` の `headingLevel` には、置いた節の見出しの一つ下の段を書く。`##` は h3 で描かれるので、`##` の節の中は `h4`、`###` の中は `h5`、`####` の中は `h6`、最初の `##` より前は `h3`。書き忘れと段の取り違えは `components/site/mdx-base/article-outline.test.ts` が落とす。
- OGP画像には記事のタイトルが入る。コードが主役の記事では、載せたいコードブロックの1つに `// [!og]` を書くと、そのコードも描かれる。

### 2. 数式を使う記事

数式の変換（`@repo/mdx-preset` の remark・rehype の preset。remark-math と Temml）は `apps/main/vite.config.ts` の MDX の設定で全記事に効いているため、本文では `$...$`・`$$...$$`・` ```math ` フェンスがそのまま使える。式は MathML になり、ブラウザが `font-family: math` のフォントで描く。数式の CSS（縦書きの調整を含む）は mdx-base が読むので、記事は import しない。既存の例: `apps/main/src/content/blog/contrast-color/article.mdx`。

カンマで区切った数は、`$(64, 128, 192)$` のようにカンマの後ろに空白を書く。空白が無いと Temml が `64,128,192` を1つの数にまとめ、カンマの後ろが詰まる。

### 3. 動く例（HTML・CSS・JS・React で書けるデモ）

HTML・CSS・JS か、React の部品（tsx）で書けるデモは、記事のコードブロックのメタに `demo="<名前>"` を書く。記事に見せたコードがそのまま動くので、Playground や `_components` を作らない。

````mdx
```html demo="dots"
<ul class="dots">
  <li style="--i: 0"></li>
</ul>
```

```css demo="dots"
.dots li {
  /* [!hl] */
  animation-delay: calc(abs(var(--i) - 3) * 50ms);
}
```
````

- 同じ名前のブロックを隣り合わせに書くと、1つの例になる。記事ではタブ（html・css・js）の隣に結果が出て、どの例にも「やり直す」が付く
- 言語は `html`・`css`・`js`・`tsx`。`js` は module の script として、HTML の後に動く。1つの例に `js` と `tsx` の両方は書かない
- `tsx` は React の部品を `export default` で書く。描く（`createRoot`）のはビルドが足すので、記事には書かない。React はサイトと同じ安定版で、`react` と `react-dom` のほかは import できない（ビルドが止まる）。ビルドが本番版の React ごと束ね、例の文書は gzip で 70kB ほどになる
- 例に固有の見た目（大きさ・色・並べ方）はすべてコードに書き、要の行は `[!hl]` で強調する。サイトのトークンは使えない。テーマで変える色は `light-dark()` で書く（記事のテーマが例に届く）
- 名前は URL（`/blog/{slug}/demos/{名前}`）になるので、小文字の英数字とハイフンで書く。離れたブロックに同じ名前を付けると、`features/blog/application/article-files.test.ts` が落ちる
- 例は sandbox の iframe（origin を持たない）で動き、外へは何も読みに行けない。localStorage・クリップボード・Wake Lock のように origin や権限が要るデモは Playground で作る

### 4. Playgroundコンポーネント（動く例で作れないデモ）

デモは `apps/main/src/playgrounds/{feature-name}/` に置く。置くのは、デモ本体と CSS Modules、Story、セクションの定義（`index.ts`）。作るときは [references/playground.md](references/playground.md) を読む。

## データベースマイグレーション

### マイグレーションファイルの生成

```bash
pnpm run -F @repo/database generate:custom
```

### SQLの記述

> **重要: id を手で振らない。** タグは `name`、ブログは `slug`（どちらも UNIQUE）で引く。
> これにより autoincrement で採番済みのタグと **id が衝突せず**、再適用しても安全（冪等）になる。
> 埋めるのは **slug・日付・タグ名** だけ。

生成されたSQLファイルに以下を記述：

```sql
-- タグ: id は書かない。既存なら何もしない
INSERT INTO tags (name) VALUES ('タグ名') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログ: slug が一意なので id は書かない
INSERT INTO blogs (slug, published, created_at)
VALUES ('{slug}', 1, '{date}T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化（ブログは slug で引く）
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = '{slug}'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け（ブログは slug、タグは name で引く。タグの数だけ繰り返す）
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = '{slug}'),
  (SELECT id FROM tags WHERE name = 'タグ名')
) ON CONFLICT DO NOTHING;
```

> **注意**: 紐付けで参照するタグ名は、既存の **正確な name** と一致させること（`(SELECT id FROM tags WHERE name = ...)` が該当なしだと migration が落ちる）。
> タグをリネームした場合は、以降の migration では新しい name を使う。
> スライド/トークを migration で投入する場合も、同様に id を書かず slug / name で引く。

### 公開・非公開の切り替え

公開状態は `blogs.published` を書き換えるマイグレーションでだけ変える。下書きのまま入れるときは上の INSERT の `published` を `0` にし、公開するときに別のマイグレーションで書き換える。

```sql
UPDATE blogs SET published = 1 WHERE slug = '{slug}';
```

マージすると CI が本番の DB にマイグレーションを流し、そのあと main をビルドしてデプロイするので、公開は main のデプロイと同時に反映される。

### タグ名の確認

id は採番しないので、必要なのは **既存タグの正確な name** を知ることだけ（表記ゆれ防止）。

```bash
# 既存タグ名の一覧（(id, name) を書いた INSERT も (name) だけの INSERT も拾う）
grep -rhoE "INSERT INTO tags [^;]*'[^']+'" packages/database/migrations/*.sql \
  | grep -oE "'[^']+'" | sort -u
```

- 既存タグはそのままの name で紐付ける（新規 INSERT は不要、`ON CONFLICT` で安全だが書かなくてよい）。
- 新規タグは `INSERT INTO tags (name) VALUES ('新タグ') ON CONFLICT (name) DO NOTHING;` を足すだけ。

## チェックリスト

### ファイル作成

- [ ] `apps/main/src/content/blog/{slug}/article.mdx` 雛形作成（Web 機能の記事なら `featureIds` と `<BrowserSupportStatus>` の ID をそろえる）
- [ ] `<LinkCard>` を使う場合: `pnpm run -F main generate:link-card-metadata` を流し（「OGP が取れなかった」が出たら時間をおいて流し直す）、`link-card-metadata.json` をコミット
- [ ] HTML・CSS・JS・React（tsx）で書けるデモは、コードブロックに `demo="<名前>"` を書く（必要な場合）
- [ ] Playgroundのデモと `.module.css` 作成（origin や権限が要るデモなど、動く例で作れない場合）
- [ ] Storybookストーリー作成（必要な場合）

### データベース

- [ ] マイグレーションSQL作成
- [ ] `pnpm run -F @repo/database generate:custom` 実行済み

### 次のステップ

- [ ] 「記事の決まり」に沿って本文を書き、公開前に `/blog-review` でレビューする
