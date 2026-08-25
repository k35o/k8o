# packages/auth-shell CLAUDE.md

apps/admin と apps/ai で共有する Better Auth の認証ゲートとアプリシェル。両アプリは
同じ認証（GitHub OAuth + `ALLOWED_EMAILS`）・同じ CSP・同じサインイン画面を持つため、
セキュリティパッチが片方のコピーにしか当たらない事故を防ぐ目的でここへ集約している。

**認証まわりの修正はこのパッケージだけを直す。アプリ側にコピーを作らない。**

## 防御層

- `verify-session.ts` … Server Component / Server Action 用。未ログイン・許可外は
  `/sign-in` へ redirect する。許可リストはサインアップ時のみ評価され既存セッションは
  失効しないため、毎回 `isAllowedEmail` を再評価して失効ギャップを塞いでいる
- `proxy.ts` … `createProxy(publicPathPrefixes)` で middleware を組み立てる。CSP 等の
  セキュリティヘッダは常に付与する。`/sign-in` は常に公開、それ以外の公開パスは
  引数の前方一致で指定する（ai の `/s/`）。**middleware は `/api` を守らない**
- `auth-enabled.ts` … 認証の有効/無効の一元管理。Vercel preview と
  `LOCAL_AUTH_BYPASS`（`NODE_ENV=development` のときのみ）で OFF になる

`/api` 配下や課金の伴う境界は middleware では守れないため、アプリ側の追加ゲートで
守る（ai の `shared/auth/require-allowed-session.ts` が 401 を返す例）。

## アプリ側の使い方

Next.js の規約ファイル（`error.tsx` / `(public)/layout.tsx` / `api/auth/[...all]/route.ts`）は
所定のパスに置く必要があるため、アプリ側には re-export だけを残す。`proxy.ts` の
`config`（matcher）は Next が静的解析するのでアプリ側にリテラルで置く。

アプリ固有の文言は props で渡す（`SignInPage` の `title` / `description`）。差分が
無いものは引数化せず、実際に差分が出た時点でパラメータを足す。

`global-error.tsx` はフォント（`_styles/font.ts`）とグローバル CSS がアプリ側にあるため、
`html` / `body` はアプリに残し、中身だけを `GlobalErrorContent` として共有する。
