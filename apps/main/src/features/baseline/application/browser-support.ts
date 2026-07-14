import { CORE_BROWSERS } from '@repo/helpers/browser/detect-browser';
import type {
  BaselineBrowser,
  BaselineMinVersions,
} from '@repo/helpers/browser/detect-browser';

import { fetchBrowserSupport } from '../infrastructure/browser-support-repository';

const isBaselineBrowser = (value: string): value is BaselineBrowser =>
  (CORE_BROWSERS as readonly string[]).includes(value);

// アプリが動作保証する各ブラウザの最低版。同期時に算出済みの browser_support を読むだけで、
// Blog には依存しない。
export async function getBaselineMinVersions(): Promise<BaselineMinVersions> {
  const rows = await fetchBrowserSupport();

  const minVersions: BaselineMinVersions = {};
  for (const row of rows) {
    if (
      row.version !== null &&
      row.version !== '' &&
      isBaselineBrowser(row.browser)
    ) {
      minVersions[row.browser] = row.version;
    }
  }
  return minVersions;
}
