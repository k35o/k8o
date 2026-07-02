#!/bin/bash

set -euo pipefail

filter_pnpm_noise() {
  grep -v '^ *>' | grep -v 'ELIFECYCLE' || true
}

stdout_file=$(mktemp)
stderr_file=$(mktemp)
trap 'rm -f "${stdout_file}" "${stderr_file}"' EXIT

# reporterは指定順に実行される。symbols(default)はconfiguration hintsをstderrに、
# markdownはレポート本文をstdoutに出すため、1回の実行で両方を取得できる。
# stdout上のsymbols出力とmarkdown出力は "# Knip report" 行を境に分割する
set +e
pnpm knip --reporter symbols --reporter markdown >"${stdout_file}" 2>"${stderr_file}"
exit_code=$?
set -e

# exit code 2以上は実行エラーとして失敗させる
if [[ "${exit_code}" -ge 2 ]]; then
  filter_pnpm_noise <"${stdout_file}"
  filter_pnpm_noise <"${stderr_file}"
  exit "${exit_code}"
fi

markdown_output=$(sed -n '/^# Knip report$/,$p' "${stdout_file}" | filter_pnpm_noise)

# markdown reporterの出力が "# Knip report" のみなら問題なし
stripped=$(echo "${markdown_output}" | sed '/^$/d' | sed 's/^[[:space:]]*//')
if [[ "${stripped}" == "# Knip report" ]]; then
  has_issues=false
else
  has_issues=true
fi

# config-hintsの抽出（symbols reporterがstderrに出力する）
config_hints=$(sed -n '/^Configuration hints/,/^$/p' "${stderr_file}")
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
