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

apps/admin のStorybookは **`admin-storybook-mcp`** を使うこと。利用ルールは apps/main と同じ（`list-all-documentation` → `get-documentation` → 推測せず確認、Storyの新規作成・更新前に `get-storybook-story-instructions`、作業後に `run-story-tests`）。

## 認証

Better Auth + GitHub OAuth。ローカル開発URL は `http://admin.localhost:1355/`。

設定や運用上の注意は Better Auth のスキル（`better-auth-best-practices` / `better-auth-security-best-practices`）を参照すること。
