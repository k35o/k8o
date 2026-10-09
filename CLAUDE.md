# CLAUDE.md

k8oは個人ポートフォリオサイト。Next.js App Router（main・ai）と Hono（api）の Turborepo モノレポ。ブログ(MDX)、トーク、開発者向けツール群、AIツール群を提供する。

## コマンド

```bash
pnpm run dev                  # 開発（ローカルDB含む全パッケージ起動）
pnpm run build
pnpm run check                # Vite+ / OXC lint・format チェック（check:write で自動修正）
pnpm run type-check
pnpm run ls-lint              # ファイル名規約チェック
pnpm run test                                           # 全テスト
pnpm run test -- --project="features test"              # feature系のみ
pnpm run test -- --project=storybook                    # Storybookテストのみ
pnpm run -F main storybook    # Storybook起動 (port 6006)
pnpm run -F @repo/database migrate

# Visual Regression Testing (storybook-addon-vrt)
pnpm -F main run test:vrt        # Storyごとのスクリーンショット撮影（aiも同様）
pnpm -F main exec svrt compare   # ベースラインと比較してレポート生成
pnpm -F main exec svrt approve   # 変更を新しいベースラインとして承認
```

## モノレポ構成

```
apps/main/          → Next.jsアプリ（メイン）            → apps/main/CLAUDE.md
apps/api/           → Hono の API（api.k8o.me）          → apps/api/CLAUDE.md
apps/ai/            → AIツール群（ai.k8o.me）            → apps/ai/CLAUDE.md
packages/auth-shell/→ aiの認証ゲートとアプリシェル      → packages/auth-shell/CLAUDE.md
packages/database/  → Drizzle ORM + Turso (libSQL)       → packages/database/CLAUDE.md
packages/helpers/   → 共有ユーティリティ                  → packages/helpers/CLAUDE.md
packages/typescript-config・code-highlight → 共有設定・コードハイライト
packages/oxlint-plugin/ → リポジトリ固有のoxlintカスタムルール（k8o/*）
```

各 app / package 固有の規約は、対応する `CLAUDE.md` を参照すること。

`@repo/database` を直接 import するのは `apps/*/src/features/*/infrastructure/` を基本とし、小さい読み取りに限り `features/*/application` に置いてもよい。書き込みや外部接続の詳細は infrastructure へ切り出す。`app/` や `features/*/interface` から直接読まない。例外として `@repo/database/auth` だけは ai の `shared/auth` から import してよい（`@repo/auth-shell` に乗らないアプリ固有の認可ゲート用。現状は ai の `require-allowed-session` が該当）。この層境界は oxc カスタムルール `k8o/database-import-boundary` で機械的に強制される（application を小さな読み取りに留める質の部分はレビューで担保する）。drizzle の演算子（`eq` / `and` / `count` など）も `@repo/database/orm` から import し、apps は drizzle-orm に直接依存しない（`no-restricted-imports` で強制）。

## コーディング規約

- `type` を使う（`interface` は使わない。module augmentation の `.d.ts` は例外）。`enum` 禁止。いずれもOXCで強制
- `any` 禁止、戻り値型は明示、`forEach` 禁止（`for...of` を使う）
- ファイル名はすべてkebab-case（ls-lintで検証）
- コメント・テスト記述は日本語を推奨

## テスト戦略

| 対象 | 手法 | 場所 |
|------|------|------|
| Helpers | In-source testing (`if (import.meta.vitest)`) | `packages/helpers/src/**/*.ts` |
| Components | Storybook stories + play関数 | `apps/main/src/app/**/*.stories.tsx` |
| Features | Vitest unit tests | `apps/main/src/features/**/*.test.ts` |
| Shared | Vitest unit tests | `apps/main/src/shared/**/*.test.ts` |

`describe` は「正常系 / 異常系 / エッジケース」でグループ化する。ブラウザの挙動確認には `/agent-browser` スキルを使うこと。

## UI共通（apps/main・apps/ai）

- Tailwindは@k8ordo/uiのセマンティックトークンのみ使用（`text-fg-base` ○ / `text-gray-900` ×。標準Tailwindカラー禁止）。ドキュメントは各appの `node_modules/@k8ordo/ui/docs/` を参照
- デザインシステムのコンポーネントのpropsを推測で使わない。`shadow` のような一般的に見える名前でも、各appのStorybook MCPの `get-documentation` か実際のStoryで確認できたものだけを使う。ドキュメントに無いpropsは使わずユーザーに確認する
- Storyの作成・更新前に `get-storybook-story-instructions` で最新ルールを確認し、作業後は `run-story-tests` で検証する

## PRレビュー対応

bot（k8o-bot など自動レビュアー）の inline コメントには**返信しない**。返信するとさらに自動レビューが走りノイズが増える。修正コミットのpushだけで対応し、スレッドの解決は人間が判断する。人間レビュアーへのreplyは通常どおりでよい。

## 秘密（fnox）

k8o でしか使わない秘密は、ルートの `fnox.toml` に age で暗号化してコミットする。age の provider はグローバル設定のものを使う。

- 追加・更新はリポジトリ直下で `fnox set -P bot -p age <KEY>` を実行し、値は stdin で渡す。サブディレクトリで実行すると、そこに新しい `fnox.toml` ができる
- `fnox edit` は使わない。編集後のファイルだけで再暗号化するので、providers を持たないこのファイルでは値が平文で書き戻される
- グローバル設定に同名のエントリがあると、その `default`（平文）が持ち越されて書き込まれる。先に `fnox remove -g` で消す
- コミット前に、エントリが `provider = "age"` を持ち `default` を持たないことを確かめる。確かめるときに値を表示しない
- グローバルの age の recipients や identity を入れ替えるときは、古い identity を捨てる前にリポジトリ直下で `fnox reencrypt -P bot` を実行してコミットする。リポジトリの外で実行しても、この `fnox.toml` は対象にならない

## Git Hooks (vite-plus)

`vp config` が `.vite-hooks/_` にディスパッチャを生成し `core.hooksPath` を切り替える（pnpm install 時に自動実行）。

- **pre-commit**: `vp staged`（`vite.config.ts` の `staged` ブロックに従い `vp check --fix` を実行、fixedは自動stage） + `pnpm run ls-lint`
- **pre-push**: `vp check`
