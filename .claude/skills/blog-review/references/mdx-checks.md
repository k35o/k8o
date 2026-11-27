# コードハイライト、MDXコンポーネント、frontmatterの点検

## ブログ固有2: @repo/code-highlightの活用

`article.mdx`は`@repo/code-highlight`（Shiki）でハイライトされる。

> ディレクティブのほかに、フェンスのメタ`title="..."`がファイル名のラベルになる（無ければ言語名がラベルになる）。コピーボタンはすべてのコードブロックに付き、本文を挟まずに続けて書いたコードブロックはタブで切り替える1つのブロックにまとまる。

| 項目 | 内容 | 重要度 |
|------|------|--------|
| フェンスの言語指定 | すべての` ``` `に言語を付ける（` ```ts `など）。言語なしはハイライトが効かない | 要修正 |
| `[!og]`マーカー | いずれか1つのコードブロックに`// [!og]`（OGP画像に載るコードを選ぶ）。OGP画像（`/blog/<slug>/og.png`）は全記事で`getBlogOgCode`がこのマーカーのコードを探して描く。無いとコードが載らず劣化（エラーにはならない）。**較正: [!og]無しの記事も全体の約2割あり、コード無しOGPを許容する設計。コードが主役の記事であれば推奨、そうでなければ任意** | 推奨/任意 |
| 注目行の強調 | 地の文で「この行が重要」と言うコードに`[!hl]`/`[!callout:]`が無ければ付ける余地 | 任意 |
| 差分の表現 | before/after・追加削除を見せるコードに`[!+]`/`[!-]`が使える（現状ほぼ未使用） | 任意 |

**ディレクティブ構文**（`packages/code-highlight/src/parser.ts`）: コメント1行だけの行に書き、次のコード行に適用。パーサは言語に関係なく全コメント形式（`//` `/* */` `#` `--` `<!-- -->`）を受理する（言語と違う形式でも効く）。種類: `[!hl]`(=`[!highlight]`)／`[!+]`／`[!-]`／`[!callout: テキスト]`／`[!og]`（本文上は無表示）。`[!fold]`〜`[!fold-end]`だけは範囲で、間の行を記事では「⋯」に畳む（動く例のブロックでだけ書け、閉じ忘れと入れ子はパーサが投げる）。未知ディレクティブはコードに残る／空`[!callout:]`は無視／末尾の宙ぶらりんは消える。`@repo/code-highlight/parser`の`parseAnnotations(code).annotations`で機械的に確認できる（`features/blog/application/og-code.ts`が同じ使い方）。

## ブログ固有3: MDXコンポーネントの利用

下の部品は`apps/main/src/components/blog/blog-mdx-components`の`blogMdxComponents`で渡されるので、MDXでは import しない。propsが正しいか確認する。

| コンポーネント | 主なprops |
|---------------|-----------|
| `BrowserSupportStatus` | `featureId`（frontmatterの`featureIds`と一致）。Web機能の記事ではH1直下 |
| `LinkCard` | `href`（必須） / `variant?` |
| `Image` / `FloatImage` | `src`・`alt`・`width`・`height`（すべて必須。width と height は画像の縦横比に合わせる） / `loading?` |
| `Alert` | `tone`（`warning`等） / `message` |

- **動く例**: コードブロックのメタに`demo="<名前>"`を書いた HTML・CSS・JS・tsx は、記事の中で動く。説明に要る見た目（大きさ・色・並べ方）がコードに書いてあり、要の行が`[!hl]`で強調されているかを見る。説明に使わない見た目の行が`[!fold]`で畳まれず、見せるコードを長くしていないかも見る。tsx は部品を`export default`で書き、`react`と`react-dom`のほかを import していないかを見る。`_components`で動かしているデモは、動く例に替えられないかを指摘する。
- 見出し・段落・リンク・インラインコードは`apps/main/src/components/site/mdx-base`が自動で@k8ordo/uiスタイルに変換する。素のmarkdownで書けばよい（独自に`<h2>`等を書かない）。
- **import検証**: MDXが`@/`・`next`・`next-themes`を import していたら要修正（`features/blog/application/article-files.test.ts`が落ちる）。画像と記事だけの部品は`./_images/...`・`./_components/...`の相対パスで import し、そのファイルと`export`宣言があるかを1つずつ目視確認する。
- **@k8ordo/uiのpropsは推測しない**。`Alert`等は `apps/main` の CLAUDE.md に従い `main-storybook-mcp` で確認する。**MCPが使えない場合**は `apps/main/node_modules/@k8ordo/ui` の型定義（`dist/**/*.d.mts`）または `docs/` を読む。

## ブログ固有4: frontmatter整合性

`apps/main/src/shared/mdx/frontmatter.ts`の`isFrontmatter`が**コードで検証するのは型だけ**（必須キーの有無・日付が`Date.parse`可能・`featureIds`が文字列配列）。`featureIds`⇔`<BrowserSupportStatus>`の一致は慣習なので人手で確認する。

| フィールド | 必須 | チェック |
|-----------|:----:|---------|
| `title` | ✅ | 文字列。本文先頭の`# <title>`と一致 |
| `description` | ✅ | キー必須（値は`null`可）。形はSKILL.mdのブログ固有1で見る |
| `createdAt` / `updatedAt` | ✅ | `Date.parse`可能な日付（例: `2026-05-26`）。更新したなら`updatedAt`が新しいか |
| `featureIds` | 任意 | 文字列配列（型はコードが検証）。**各IDが本文の`<BrowserSupportStatus featureId="..." />`と1対1で一致**するか人手確認（片方だけ・綴り違いを指摘） |

frontmatterが不正だと`getFrontmatter()`が`Invalid frontmatter in <path>`で落ちる。必須キー欠落・日付不正は要修正。
