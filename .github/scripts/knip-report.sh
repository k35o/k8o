#!/bin/bash

filter_pnpm_noise() {
  grep -v '^ *>' | grep -v 'ELIFECYCLE'
}

set +e
markdown_output=$(pnpm knip --reporter markdown 2>&1 | filter_pnpm_noise)
default_output=$(pnpm knip 2>&1 | filter_pnpm_noise)
exit_code=$?
set -e

# exit code 2以上は実行エラーとして失敗させる
if [[ "${exit_code}" -ge 2 ]]; then
  echo "${default_output}"
  exit "${exit_code}"
fi

# markdown reporterの出力が "# Knip report" のみなら問題なし
stripped=$(echo "${markdown_output}" | sed '/^$/d' | sed 's/^[[:space:]]*//')
if [[ "${stripped}" == "# Knip report" ]]; then
  has_issues=false
else
  has_issues=true
fi

# config-hintsの抽出
config_hints=$(echo "${default_output}" | sed -n '/^Configuration hints/,/^$/p')
if [[ -n "${config_hints}" ]]; then
  has_config_hints=true
else
  has_config_hints=false
fi

if [[ "${has_issues}" == false && "${has_config_hints}" == false ]]; then
  echo "問題は見つかりませんでした :tada:"
  exit 0
fi

if [[ "${has_issues}" == true ]]; then
  echo "${markdown_output}"
  echo ""
fi

if [[ "${has_config_hints}" == true ]]; then
  echo "## Configuration Hints"
  echo ""
  echo '```'
  echo "${config_hints}"
  echo '```'
fi
