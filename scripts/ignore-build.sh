#!/bin/bash
# Vercel Ignored Build Step
# 使い方: bash scripts/ignore-build.sh <app-name>
# exit 0 = ビルドスキップ, exit 1 = ビルド実行

set -euo pipefail

readonly APP_NAME="${1:-}"

log() {
  echo ">> $*"
}

if [ -z "$APP_NAME" ]; then
  echo "Usage: bash scripts/ignore-build.sh <app-name>" >&2
  exit 1
fi

# renovateブランチはpreviewビルドをスキップ
if [[ "${VERCEL_GIT_COMMIT_REF:-}" == renovate/* ]]; then
  log "Skipping: Renovate branch (${VERCEL_GIT_COMMIT_REF})"
  exit 0
fi

# mainブランチのproductionビルドでは merge-base が HEAD 自身となり affected が空になるため、
# 前回成功したデプロイのSHAを base に使う。preview ビルドでは origin/main との差分を見る
readonly BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-origin/main}"
log "Using BASE_SHA=$BASE_SHA"

# 変更ファイルが取得できなければ安全側に倒してビルド
if ! CHANGED_FILES=$(git diff --name-only "$BASE_SHA" HEAD 2>&1); then
  log "Proceeding: failed to get changed files ($CHANGED_FILES)"
  exit 1
fi

# ビルド判定ロジック自体や Vercel 設定が変わったら安全側に倒してビルド
if echo "$CHANGED_FILES" | grep -qE "^(scripts/ignore-build\.sh|apps/$APP_NAME/vercel\.json|turbo\.json)$"; then
  log "Proceeding: build configuration changed"
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

if echo "$AFFECTED" | grep -q "\"name\": \"$APP_NAME\""; then
  log "Proceeding: $APP_NAME is affected"
  exit 1
fi

log "Skipping: $APP_NAME is not affected"
exit 0
