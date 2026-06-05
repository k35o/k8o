# apps/admin AGENTS.md

管理サイト。Better Auth + GitHub OAuth で認証する。

## レイヤー構成（src/）

apps/main と同じ `app / features / shared` 構成。Server-side処理の置き場所も同じく `features/*/interface`（Next.jsとの境界）と `features/*/application` / `features/*/infrastructure` に分ける。

- **app/** - Next.js App Router の entry と UI composition。UIは `app/**/_components`
- **features/** - 非UIロジック。`interface / application / infrastructure` の3層
- **shared/** - apps/admin 内で横断利用する非UI共通処理。UIや `cn` は置かない

### Server Actions の置き場所

`_actions` は新規作成しない。Server Actions（`'use server'`）は `features/*/interface` に置くこと。

## React/Next.js

- Next.jsの機能やAPIについては `apps/admin/node_modules/next/dist/docs/` のバンドルドキュメントを参照すること
- Server Componentsがデフォルト、必要な場合のみ `'use client'`
- 関数コンポーネントのみ
- `forwardRef` 禁止

## TailwindCSS：ArteOdysseyカスタムトークンのみ使用

ArteOdysseyのドキュメントは `apps/admin/node_modules/@k8o/arte-odyssey/docs/` を参照すること。

```tsx
// ✅ Good
<div className="text-fg-base bg-bg-base">

// ❌ Bad（標準Tailwind禁止）
<div className="text-gray-900 bg-white">
```

## UIコンポーネント作業時のStorybook MCP利用

apps/admin のStorybookは **`admin-storybook-mcp`** を使うこと。

- UIコンポーネントを扱う作業では、回答や実装に入る前に必ず `admin-storybook-mcp` を使い、Storybook上のコンポーネント情報とドキュメントを確認すること
- **重要: コンポーネントのpropsを推測で使わないこと。** デザインシステムのコンポーネントでpropsを1つでも使う前に、`shadow` のような一般的に見える名前であっても、MCPツールでそのpropsが実際に定義されているか確認すること
- まず `list-all-documentation` を実行して、利用可能なコンポーネント一覧を取得すること
- 次に対象コンポーネントに対して `get-documentation` を実行し、利用可能なprops、説明、サンプルを確認すること
- 明示的にドキュメント化されているprops、またはサンプルStory内で使用されているpropsだけを使うこと
- propsがドキュメントに存在しない場合、命名規則や他ライブラリの慣習から推測して使ってはいけない。その場合はユーザーに確認すること
- Storyの新規作成や更新を行う前に、必ず `get-storybook-story-instructions` を実行して最新の作成ルールと推奨事項を確認すること
- 作業後は `run-story-tests` を実行して検証すること
- Story名と実際のprops名が一致しない場合があるため、Story名だけで判断せず、必ずドキュメントまたはサンプル実装でpropsを確認すること

## 認証

Better Auth + GitHub OAuth。ローカル開発URL は `https://admin.k8o.localhost/`。

認証の有効/無効は `src/shared/auth/auth-enabled.ts` の `isAuthEnabled` に集約し、`proxy.ts`（middleware）と `verify-session.ts` の両方が参照する。

- Vercel preview は認証OFF
- ローカル開発で `LOCAL_AUTH_BYPASS=true`（`.env.local`）を設定するとログインを省略できる。`NODE_ENV=development` のときだけ評価するため、本番では無視され bypass は起こらない
- 実際にローカルでGitHubログインを検証したいときは `LOCAL_AUTH_BYPASS` を外す（その場合は GitHub OAuth アプリのコールバックを `https://admin.k8o.localhost/api/auth/callback/github` に設定）

設定や運用上の注意は Better Auth のスキル（`better-auth-best-practices` / `better-auth-security-best-practices`）を参照すること。
