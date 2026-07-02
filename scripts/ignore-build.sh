#!/bin/bash
# Vercel Ignored Build Step
# 使い方: bash scripts/ignore-build.sh <app-name> [pkg-name]
#   app-name: ディレクトリ名（apps/<app-name>）
#   pkg-name: turbo affected で判定するパッケージ名（省略時は app-name）
#             ディレクトリ名とパッケージ名が異なる場合に指定する（例: ai → @repo/ai）
# exit 0 = ビルドスキップ, exit 1 = ビルド実行

set -euo pipefail

readonly APP_NAME="${1:-}"
readonly PKG_NAME="${2:-${1:-}}"

log() {
  echo ">> $*" >&2
}

if [ -z "$APP_NAME" ]; then
  echo "Usage: bash scripts/ignore-build.sh <app-name>" >&2
  exit 1
fi

# 同一commitの再ビルド（Vercelダッシュボードからの手動Redeployやenv var変更後の再ビルド）は常に実行する
if [ -n "${VERCEL_GIT_COMMIT_SHA:-}" ] \
  && [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] \
  && [ "${VERCEL_GIT_COMMIT_SHA}" = "${VERCEL_GIT_PREVIOUS_SHA}" ]; then
  log "Proceeding: redeploy of same commit (${VERCEL_GIT_COMMIT_SHA})"
  exit 1
fi

# mainブランチのproductionビルドでは merge-base が HEAD 自身となり affected が空になるため、
# 前回成功したデプロイのSHAを base に使う。preview ビルドでは origin/main との差分を見る
readonly BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-origin/main}"
log "Using BASE_SHA=$BASE_SHA"

# Vercelのshallow cloneにはbranchのtipしか含まれないため、origin/mainをbaseに使う場合は
# 明示的にfetchしないと `git diff` や turbo の base 参照解決に失敗する。
# Vercelビルド環境では `origin` リモートが未設定のケースがあるため、
# 既存リモートがなければ環境変数からGitHubのURLを組み立てて直接fetchする。
if [ "$BASE_SHA" = "origin/main" ]; then
  if FETCH_URL=$(git remote get-url origin 2>/dev/null); then
    :
  elif [ -n "${VERCEL_GIT_REPO_OWNER:-}" ] && [ -n "${VERCEL_GIT_REPO_SLUG:-}" ]; then
    FETCH_URL="https://github.com/${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}.git"
  else
    FETCH_URL=""
  fi

  if [ -z "$FETCH_URL" ]; then
    log "Warning: could not resolve remote URL for main fetch"
  elif ! git fetch --depth=1 "$FETCH_URL" main:refs/remotes/origin/main 2>&1; then
    log "Warning: git fetch $FETCH_URL main failed, may cause fallback to build"
  fi
fi

# 前回成功デプロイが無い（新規プロジェクトの初回など）と BASE が origin/main = HEAD 自身に
# 解決し、差分が常に空になって永久に skip してしまう。判定不能なので安全側に倒してビルドする。
if [ "$(git rev-parse --verify "$BASE_SHA" 2>/dev/null)" = "$(git rev-parse --verify HEAD 2>/dev/null)" ]; then
  log "Proceeding: BASE_SHA resolves to HEAD (no previous deploy / first build)"
  exit 1
fi

# 変更ファイルが取得できなければ安全側に倒してビルド
if ! CHANGED_FILES=$(git diff --name-only "$BASE_SHA" HEAD 2>&1); then
  log "Proceeding: failed to get changed files ($CHANGED_FILES)"
  exit 1
fi

# ビルド判定ロジック自体や Vercel 設定、ルート依存に関わるファイルが変わったら安全側に倒してビルド
if echo "$CHANGED_FILES" | grep -qE "^(scripts/ignore-build\.sh|apps/$APP_NAME/vercel\.json|turbo\.json|mise\.toml|package\.json|pnpm-workspace\.yaml|pnpm-lock\.yaml)$"; then
  log "Proceeding: build configuration or root deps changed"
  exit 1
fi

# turbo affected で対象アプリに影響があるか判定
# NOTE: 旧来の `turbo query "query { affectedPackages { ... } }"` は TURBO_SCM_BASE 等の
# 環境変数を尊重せず常に空を返すため、`turbo query affected --base` を使う
if ! AFFECTED=$(pnpm turbo query affected --packages --base "$BASE_SHA"); then
  log "Proceeding: turbo query failed"
  exit 1
fi
echo "$AFFECTED"

if echo "$AFFECTED" | grep -q "\"name\": \"$PKG_NAME\""; then
  log "Proceeding: $APP_NAME is affected"
  exit 1
fi

log "Skipping: $APP_NAME is not affected"
exit 0
