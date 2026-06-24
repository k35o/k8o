# apps/ai AGENTS.md

AI関連ツールの置き場（`ai.k8o.me`）。第1号は arte-odyssey × Sakana Fugu の v0風デザインシステム壁打ちツール。

## レイヤー構成（src/）

apps/admin / apps/main と同じ `app / features / shared` 構成。

- **app/** - Next.js App Router の entry と UI composition。UIは `app/**/_components`
- **features/** - 非UIロジック。`interface / application / infrastructure` の3層
  - `generation/` - Sakana Fugu（OpenAI互換, AI SDK v6）による TSX 生成（レート制限もここ）
  - `preview/` - 編集中のライブプレビュー（ローカルも本番も Vercel Sandbox に一本化）
  - `share/` - 公開共有（公開/Sandbox 配信/非公開化）
  - `projects/` - プロジェクト・版の永続化（@repo/database）
  - `highlight/` - 生成コードの shiki ハイライト
  - Vercel Sandbox の起動/配信は `preview/infrastructure/sandbox-preview.ts` に集約し、share は `preview/application/sandbox-runtime.ts`（公開境界）経由で利用する
- **shared/** - 横断利用の非UI共通処理（auth ゲートなど）。UIや `cn` は置かない

Server Actions（`'use server'`）は `features/*/interface` に置く。`_actions` は新規作成しない。

## 認証 & コスト保護

Better Auth + GitHub OAuth（`@repo/database/auth` を共用）。**本人のみ**利用可（`ALLOWED_EMAILS`）。

LLM / サンドボックスは課金が発生するため、**課金が発生する全 API route / server action の先頭で `shared/auth/require-allowed-session.ts` を呼び、未許可は 401 で弾く**こと（middleware は `/api` を守らないため必須の防御層）。

認証の有効/無効は `src/shared/auth/auth-enabled.ts` に集約。Vercel preview は認証OFF（= preview URL は課金の開き戸になるため、ai プロジェクトには Vercel Deployment Protection を併用する）。

ローカル開発URLは `https://ai.k8o.localhost/`。`LOCAL_AUTH_BYPASS=true`（`.env.local`, NODE_ENV=development のときのみ）でログインを省略できる。

## TailwindCSS：ArteOdysseyカスタムトークンのみ使用

ArteOdysseyのドキュメントは `apps/ai/node_modules/@k8o/arte-odyssey/docs/` を参照すること。標準Tailwindカラーは禁止。

```tsx
// ✅ Good
<div className="text-fg-base bg-bg-base">
// ❌ Bad
<div className="text-gray-900 bg-white">
```

## Storybook MCP

UIコンポーネント作業では、props を推測で使わず Storybook の情報を MCP で確認すること（ai 用 Storybook MCP は今後登録予定。それまでは arte-odyssey の docs を参照）。
