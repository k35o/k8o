---
name: blog-review
description: k8oブログ記事（MDX）専用の公開前レビュースキル。文章面は /writing-review に委譲（不在時はフォールバック）し、@repo/code-highlight の活用・frontmatter整合性・MDXコンポーネント・見出し階層・本文の太字不使用といった MDX/ブログ固有の項目を点検して指摘レポートを出す（ファイルは変更しない）。
---

# ブログ記事レビュースキル

k8oのブログ記事（MDX）を公開前にレビューする。**文章面は `/writing-review`** に委譲し、本スキルは**ブログ/MDX固有のチェック**（コードハイライト・frontmatter・MDXコンポーネント・見出し階層・太字不使用）を足す薄い層。最終レポートは文章面とブログ固有を**1つに統合**して出す。

## 対象範囲

**行うこと**: `/writing-review` の文章観点をブログ記事に適用（不在時はフォールバック）／`@repo/code-highlight`のディレクティブ活用／frontmatter整合性（`featureIds`⇔`<BrowserSupportStatus>`）／MDXコンポーネントのimport・props／見出し階層・リンク・画像／本文の太字不使用。重要度つきの統合レポートを出す。

**行わないこと**: ファイルの自動修正（レポートのみ）／執筆・アウトライン作成／公開ファイル一式の準備（`article.mdx`の雛形/マイグレーション → `/blog-prep`）／コードの動作・技術的正しさ（別途確認）。

> 記事の準備は `/blog-prep`。本スキルはその後段（執筆を終えた記事の公開前レビュー）。修正依頼でもまずレポートを出して合意してから着手する。**ファイルは変更しない。**

## レビュー対象の特定

```
apps/main/src/content/blog/<slug>/
├── article.mdx   # 記事本体（レビューの主対象）
├── _images/      # 記事の画像（あれば）
└── _components/  # この記事だけの部品（あれば）
```

ページのメタデータ（タイトル/日付はfrontmatter、タグはDBから取得）とOGP画像（`/blog/<slug>/og.png`）は、`apps/main/src/app/blog/[slug]/`が全記事に共通で作る。

`article.mdx`: 先頭にYAML frontmatter（`---`）、続いて`import`文と本文。本文の`# H1`は**レンダリング時に非表示**（タイトルはfrontmatterの`title`をレイアウトが表示する）。実セクションは`##`から始め、表示時に`##`→h3相当・`###`→h4相当へ1段繰り下げられる（執筆時は`##`/`###`をそのまま書く）。内部リンクは`next/link`、外部リンクは通常リンクへ自動変換。

## レビューの進め方

1. **文章面**: 下記「writing-review 連携」のとおり文章観点を適用する。
2. **ブログ固有の上書き**: 本文に太字（`**`）が無いか（writing-reviewの「太字可」を上書き）。
3. **機械的補助コマンド**を実行し、ブログ固有1〜4を当てる。
4. 文章面とブログ固有の指摘を**1つのレポート**に統合し、重要度つきで出す。

### writing-review 連携（二層）

- **`/writing-review` が使える場合**: Skillツールで `writing-review` を実行し、対象 `article.mdx` を渡して、その指摘を取り込む（これを文章面の正とする）。レポートでは出所を `【writing-review】` と添える。
- **使えない場合のフォールバック**（CI・他者クローン・別マシン等、writing-review が無い環境）: 詳細表は複製しないが、最低限ここだけは自分で見る。
  - 文体混在（ですます/である）／ら抜き言葉／英語と日本語の間のスペース／AI的な太字・「重要なのは〜である」式の定型句／内容がドキュメントの焼き直しでないか（独自性）。
  - 文章系の機械コマンドは下の「機械的補助コマンド」のフォールバック節を使う。

## 機械的補助コマンド

対象記事のパスを`FILE`に入れて実行（ripgrep / awk）。

```bash
FILE='apps/main/src/content/blog/<slug>/article.mdx'
PROSE=$(awk '/^[[:space:]]*```/{f=!f;next} !f' "$FILE")   # フェンス内を除いた本文

# (1) 太字（ブログは太字禁止＝出力された全てが候補）
rg -n '\*\*[^*]+\*\*' "$FILE"
# (2) 言語指定のないコードフェンス（出力が無ければOK。~~~形式は非対象）
awk '/^[[:space:]]*```/{n++; if(n%2==1 && $0 !~ /^[[:space:]]*```[A-Za-z]/) print NR": ["$0"]"}' "$FILE"
# (3) [!og] マーカーの数（0 と出ればマーカー無し）
rg -c '\[!og\]' "$FILE" || echo 0
# (4) markdownテーブルの使用（本文では使わない。出力があれば要修正候補。先頭が | の行を検出）
rg -n '^\s*\|.*\|' "$FILE"

# writing-review が無いときのフォールバック（本文のみ＝PROSEに当てる）
rg -n '[A-Za-z0-9] [ぁ-んァ-ヶー一-龥]|[ぁ-んァ-ヶー一-龥] [A-Za-z0-9]' "$FILE"   # 英日スペース
printf '%s' "$PROSE" | rg -c '(です|ます)。'; printf '%s' "$PROSE" | rg -c '(である|だ)。'  # 文体混在の手がかり
```

> **コード除外**: (1) と英日スペースは**コードフェンス内・インラインコード（`...`）・`[!callout:]`のテキストも拾う**。マッチがコード内なら違反ではない（例: インラインコードのべき乗 `2 ** -54`、callout内の `theme と…`）。本文（`PROSE`）に当てると誤検出が減る。ブログ本文に出てくる素の`**…**`は太字なので要修正。

## ブログ固有1: @repo/code-highlightの活用

`article.mdx`は`@repo/code-highlight`（Shiki）でハイライトされる。

> ディレクティブのほかに、フェンスのメタ`title="..."`がファイル名のラベルになる（無ければ言語名がラベルになる）。コピーボタンはすべてのコードブロックに付き、本文を挟まずに続けて書いたコードブロックはタブで切り替える1つのブロックにまとまる。

| 項目 | 内容 | 重要度 |
|------|------|--------|
| フェンスの言語指定 | すべての` ``` `に言語を付ける（` ```ts `など）。言語なしはハイライトが効かない | 要修正 |
| `[!og]`マーカー | いずれか1つのコードブロックに`// [!og]`（OGP画像に載るコードを選ぶ）。OGP画像（`/blog/<slug>/og.png`）は全記事で`getBlogOgCode`がこのマーカーのコードを探して描く。無いとコードが載らず劣化（エラーにはならない）。**較正: [!og]無しの記事も全体の約2割あり、コード無しOGPを許容する設計。コードが主役の記事であれば推奨、そうでなければ任意** | 推奨/任意 |
| 注目行の強調 | 地の文で「この行が重要」と言うコードに`[!hl]`/`[!callout:]`が無ければ付ける余地 | 任意 |
| 差分の表現 | before/after・追加削除を見せるコードに`[!+]`/`[!-]`が使える（現状ほぼ未使用） | 任意 |

**ディレクティブ構文**（`packages/code-highlight/src/parser.ts`）: コメント1行だけの行に書き、次のコード行に適用。パーサは言語に関係なく全コメント形式（`//` `/* */` `#` `--` `<!-- -->`）を受理する（言語と違う形式でも効く）。種類: `[!hl]`(=`[!highlight]`)／`[!+]`／`[!-]`／`[!callout: テキスト]`／`[!og]`（本文上は無表示）。未知ディレクティブはコードに残る／空`[!callout:]`は無視／末尾の宙ぶらりんは消える。`@repo/code-highlight/parser`の`parseAnnotations(code).annotations`で機械的に確認できる（`features/blog/application/og-code.ts`が同じ使い方）。

## ブログ固有2: frontmatter整合性

`packages/helpers/src/mdx/frontmatter.ts`の`isFrontmatter`が**コードで検証するのは型だけ**（必須キーの有無・日付が`Date.parse`可能・`featureIds`が文字列配列）。`featureIds`⇔`<BrowserSupportStatus>`の一致は慣習なので人手で確認する。

| フィールド | 必須 | チェック |
|-----------|:----:|---------|
| `title` | ✅ | 文字列。本文先頭の`# <title>`と一致 |
| `description` | ✅ | キー必須（値は`null`可）。SEO向けに簡潔か |
| `createdAt` / `updatedAt` | ✅ | `Date.parse`可能な日付（例: `2026-05-26`）。更新したなら`updatedAt`が新しいか |
| `featureIds` | 任意 | 文字列配列（型はコードが検証）。**各IDが本文の`<BrowserSupportStatus featureId="..." />`と1対1で一致**するか人手確認（片方だけ・綴り違いを指摘） |

frontmatterが不正だと`getFrontmatter()`が`Invalid frontmatter in <path>`で落ちる。必須キー欠落・日付不正は要修正。

## ブログ固有3: MDXコンポーネントの利用

下の部品は`apps/main/src/app/blog/_components/blog-mdx-components`の`blogMdxComponents`で渡されるので、MDXでは import しない。propsが正しいか確認する。

| コンポーネント | 主なprops |
|---------------|-----------|
| `BrowserSupportStatus` | `featureId`（frontmatterの`featureIds`と一致）。Web機能の記事ではH1直下 |
| `PlaygroundEmbed` | `sectionId`（必須。`playgrounds/sections.ts`のセクションの`id`） / `demo?`（デモの`title`。省略するとセクションの全デモ） |
| `Playground` | `title`（必須）。子にデモ |
| `LinkCard` | `href`（必須） / `publishedAt?` / `variant?` |
| `Image` / `FloatImage` | `src`・`alt`（どちらも必須） |
| `Alert` | `tone`（`warning`等） / `message` |

- 見出し・段落・リンク・インラインコードは`apps/main/src/app/_components/mdx-base`が自動で@k8ordo/uiスタイルに変換する。素のmarkdownで書けばよい（独自に`<h2>`等を書かない）。
- **import検証**: MDXが`@/app/...`を import していたら要修正（`features/blog/application/article-files.test.ts`が落ちる）。画像と記事だけの部品は`./_images/...`・`./_components/...`の相対パスで import し、そのファイルと`export`宣言があるかを1つずつ目視確認する。`PlaygroundEmbed`は、`sectionId`が`playgrounds/sections.ts`の`playgroundSections`にあるセクションの`id`と一致するか、`demo`を渡すならそのセクションのデモの`title`と一致するかも確かめる（一致しないと描画時に例外で落ちる）。
- **@k8ordo/uiのpropsは推測しない**。`Alert`等は `apps/main` の CLAUDE.md に従い `main-storybook-mcp` で確認する。**MCPが使えない場合**は `apps/main/node_modules/@k8ordo/ui` の型定義（`dist/**/*.d.mts`）または `docs/` を読む。

## ブログ固有4: 見出し階層・リンク・画像・テーブル

> 見出しの**中身**（具体性・オチにしない・二要素を詰め込まない）は `/writing-review`（整合性・流れ）で見る。ここは MDX 描画に絡む**階層**とリンク・画像・テーブル。

- **見出し階層**: `# H1`は記事タイトルの1つだけ（非表示）。実セクションは`##`から。階層を飛ばさない（`##`の次に`####`を置かない）。同名見出しの重複に注意（アンカーID衝突）。
- **テーブルは使わない**（要修正）: markdownテーブル（`| … | … |`）は**横スクロールに弱く、特にモバイルや縦書き表示で崩れる**。本文では使わず、箇条書き・段落・定義（`用語：説明`）、または必要なら画像（`<Image>`）で代替する。機械検出は機械コマンド(4)。
- **リンク**: 空リンク（`[テキスト]()`）が無いか。外部リンクは到達性を確認（任意で `curl -sI <url> | head -1`）。参考文献は`<LinkCard href="...">`を使う選択肢。
- **画像**: `<Image>`/`<FloatImage>`に`alt`があるか（必須）。
- **数式（KaTeX）**: 数式を使う記事が`import '@repo/mdx-preset/katex.css';`を持つことは`features/blog/application/article-files.test.ts`が確かめる。`pnpm run test --filter=main -- --project="features test"`が通ることを確かめる。

## レポート形式

ファイルは変更せず、**文章面（writing-review）とブログ固有を統合した重要度別レポート**を出す。各指摘に「場所（`file:line`）・該当箇所・なぜ・修正提案」を含める。文章面の指摘には `【writing-review】` を添える。

```markdown
## ブログ記事レビュー: <slug>

### 🔴 要修正
- `article.mdx:12` 本文に太字 `**重要**` → ブログは太字を使わない。文の組み立てで強調
- `article.mdx:42` 言語指定のないコードフェンス → ` ```ts ` を付ける
- `article.mdx:55` 本文にmarkdownテーブル → 横スクロールに弱い。箇条書き/定義に置き換える
- `article.mdx:88` 文体混在（ですます/である）【writing-review】

### 🟡 推奨
- `article.mdx` コードが主役だが `[!og]` 無し（`getBlogOgCode`使用）→ 代表ブロックに `// [!og]`
- `article.mdx:15` 「React の」→「Reactの」【writing-review】

### 🟢 任意
- `article.mdx:60` 注目コードに `[!hl]` を付ける余地

### 指摘なしの観点
- frontmatter / featureIds⇔BrowserSupportStatus: OK
- MDXコンポーネント: OK
- 文章（writing-review）: 全観点（日本語ルール〜語り口・事実確認）とも問題なし
```

**重要度の天井**（writing-review と共通）:

- 客観違反（言語なしフェンス・frontmatter不正・`featureIds`不一致・本文の太字・本文のテーブル・日本語ルール違反）→ **要修正**まで可。
- 主観観点（整合性・独自性・語り口）→ 原則 **推奨**上限。例外: 論理矛盾・焼き直し（独自性ゼロの足切り該当）は要修正。
- コードの動作・技術的正確性は対象外（その旨をレポートに一言）。
- 指摘ゼロの観点も「OK」と明記する。

## チェックリスト

- [ ] 文章面: `/writing-review` を実行（不在時はフォールバックの5点＋文章系コマンド）。文章観点1〜7を網羅した
- [ ] ブログ固有の上書き: 本文に太字（`**`）が無い
- [ ] 機械的補助コマンド（太字 / 言語なしフェンス / `[!og]` / テーブル / 英日スペース / 文体）を実行した
- [ ] ブログ固有1: `@repo/code-highlight`の活用（言語・`[!og]`較正・`[!hl]`/`[!callout:]`）
- [ ] ブログ固有2: frontmatter整合性（必須キー・`featureIds`⇔`BrowserSupportStatus`）
- [ ] ブログ固有3: MDXコンポーネントのprops（importしない。MCP不在時は型定義/docsで確認）
- [ ] ブログ固有4: 見出し階層・リンク到達性・画像alt・テーブル不使用・`article-files.test.ts`が通る
- [ ] 文章面とブログ固有を統合し、重要度つきレポートを出力した（ファイルは変更していない）
