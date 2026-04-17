#!/bin/bash
# Vercel Ignored Build Step
# exit 0 = ビルドスキップ, exit 1 = ビルド実行

APP_NAME=$1

if [ -z "$APP_NAME" ]; then
  echo "Usage: bash scripts/ignore-build.sh <app-name>"
  exit 1
fi

# renovateブランチはpreviewビルドをスキップ
if [[ "$VERCEL_GIT_COMMIT_REF" == renovate/* ]]; then
  echo ">> Skipping: Renovate branch ($VERCEL_GIT_COMMIT_REF)"
  exit 0
fi

# mainブランチのproductionビルドではmerge-baseがHEAD自身となりaffectedが空になるため、
# 前回成功したデプロイのSHAをbaseに設定する
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  export TURBO_SCM_BASE="$VERCEL_GIT_PREVIOUS_SHA"
  echo ">> Using TURBO_SCM_BASE=$VERCEL_GIT_PREVIOUS_SHA"
fi

# turbo query affectedで対象アプリに影響があるか判定
AFFECTED=$(pnpm turbo query "query { affectedPackages { items { name } } }")
echo "$AFFECTED"

if echo "$AFFECTED" | grep -q "\"name\": \"$APP_NAME\""; then
  echo ">> Proceeding: $APP_NAME is affected"
  exit 1
fi

echo ">> Skipping: $APP_NAME is not affected"
exit 0
