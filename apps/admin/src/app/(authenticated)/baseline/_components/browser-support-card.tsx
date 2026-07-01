import { Card, Heading } from '@k8o/arte-odyssey';
import {
  BROWSER_LABELS,
  CORE_BROWSERS,
} from '@repo/helpers/browser/detect-browser';
import { formatDate } from '@repo/helpers/date/format';

import { getBrowserSupport } from '@/features/baseline/interface/queries';

export const BrowserSupportCard = async () => {
  const support = await getBrowserSupport();
  const versionByBrowser = new Map(support.map((s) => [s.browser, s.version]));
  const latestUpdatedAt = support.reduce<string | null>(
    (latest, s) =>
      latest === null || s.updatedAt > latest ? s.updatedAt : latest,
    null,
  );

  return (
    <section className="flex flex-col gap-4">
      <Heading type="h2">対応ブラウザの最低バージョン</Heading>
      <Card appearance="shadow">
        <div className="flex flex-col gap-3 p-6">
          <p className="text-fg-mute text-sm">
            全Baseline機能が動作する各ブラウザの最低版（同期時に自動計算）
          </p>
          <ul className="divide-border-base divide-y">
            {CORE_BROWSERS.map((browser) => {
              const version = versionByBrowser.get(browser) ?? '';
              return (
                <li
                  className="flex items-center justify-between gap-4 py-2.5"
                  key={browser}
                >
                  <span className="text-sm">{BROWSER_LABELS[browser]}</span>
                  <span className="font-mono text-sm tabular-nums">
                    {version === '' ? '—' : version}
                  </span>
                </li>
              );
            })}
          </ul>
          {latestUpdatedAt !== null && (
            <p className="text-fg-mute text-xs">
              最終計算: {formatDate(new Date(latestUpdatedAt), 'yyyy/MM/dd')}
            </p>
          )}
        </div>
      </Card>
    </section>
  );
};
