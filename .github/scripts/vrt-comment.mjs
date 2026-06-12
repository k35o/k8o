#!/usr/bin/env node
// VRTのreport.jsonからPRコメント本文(Markdown)を生成して標準出力に書く。
// 使い方: node vrt-comment.mjs <label>=<report.jsonのパス> ...
import { existsSync, readFileSync } from 'node:fs';

const runUrl = process.env.RUN_URL ?? '';
const targets = process.argv.slice(2).map((arg) => {
  const eq = arg.indexOf('=');
  return { label: arg.slice(0, eq), path: arg.slice(eq + 1) };
});

const MAX_ITEMS = 30;
const lines = ['<!-- vrt-report -->', '## 📸 Visual Regression Test', ''];

const missing = targets.filter((t) => !existsSync(t.path));
const reports = targets
  .filter((t) => existsSync(t.path))
  .map((t) => ({ ...t, report: JSON.parse(readFileSync(t.path, 'utf8')) }));

if (reports.length === 0) {
  lines.push(
    'ベースラインがまだありません。mainへのマージ後の実行でベースラインが作成され、次のPRから差分が表示されます。',
  );
} else {
  const failed = reports.some((entry) => entry.report.summary.failed);
  lines.push(
    failed
      ? '⚠️ **視覚的な差分があります。** 内容を確認し、意図した変更ならそのままマージしてください（マージ後のmain実行が新しいベースラインになります）。'
      : '✅ **差分はありません。**',
    '',
    '| | passed | changed | added | deleted |',
    '| --- | ---: | ---: | ---: | ---: |',
  );
  for (const { label, report } of reports) {
    const s = report.summary;
    lines.push(
      `| ${label} | ${s.passed} | ${s.changed} | ${s.added} | ${s.deleted} |`,
    );
  }
  for (const { label, report } of reports) {
    for (const status of ['changed', 'added', 'deleted']) {
      const items = report.items.filter((item) => item.status === status);
      if (items.length === 0) continue;
      lines.push('', `### ${label}: ${status}`);
      for (const item of items.slice(0, MAX_ITEMS)) {
        const metrics =
          item.mismatchedPixels === undefined
            ? ''
            : ` (${item.mismatchedPixels.toLocaleString()}px, ${(item.mismatchRatio * 100).toFixed(2)}%)`;
        lines.push(`- \`${item.key}\`${metrics}`);
      }
      if (items.length > MAX_ITEMS) {
        lines.push(`- …他${items.length - MAX_ITEMS}件`);
      }
    }
  }
  lines.push(
    '',
    `📦 差分画像つきレポート: [Actions run](${runUrl}) の \`vrt-report\` artifactをダウンロードし、\`report.html\` をブラウザで開く`,
  );
}
if (missing.length > 0 && reports.length > 0) {
  lines.push(
    '',
    `（${missing.map((t) => t.label).join(', ')}: ベースライン未作成のため比較をスキップ）`,
  );
}
console.log(lines.join('\n'));
