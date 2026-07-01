import { compareVersions } from '@repo/helpers/browser/baseline-support';
import type {
  BaselineBrowser,
  BaselineMinVersions,
} from '@repo/helpers/browser/detect-browser';

import { findBrowserImplementationsByFeatureIds } from '../infrastructure/baseline-snapshot-repository';
import { getFeatureBlogMap } from './feature-blog-map';

const CORE_BROWSERS: BaselineBrowser[] = [
  'chrome',
  'chrome_android',
  'edge',
  'firefox',
  'firefox_android',
  'safari',
  'safari_ios',
];

// ブログで扱っている機能(＝サイトが実際に使う機能)がすべて動くのに必要な、
// 各ブラウザの最低バージョン。webstatus.dev 由来の browser_implementations を
// admin 同期で DB に保存しており、対象機能について各ブラウザの対応版の最大値を取る。
export async function getBaselineMinVersions(): Promise<BaselineMinVersions> {
  const blogMap = await getFeatureBlogMap();
  const featureIds = Object.keys(blogMap);
  if (featureIds.length === 0) {
    return {};
  }

  const implementations =
    await findBrowserImplementationsByFeatureIds(featureIds);

  const minVersions: BaselineMinVersions = {};
  for (const browserImplementations of implementations) {
    for (const browser of CORE_BROWSERS) {
      const impl = browserImplementations[browser];
      if (
        impl?.status !== 'available' ||
        impl.version === undefined ||
        impl.version === ''
      ) {
        continue;
      }
      const current = minVersions[browser];
      if (current === undefined || compareVersions(impl.version, current) > 0) {
        minVersions[browser] = impl.version;
      }
    }
  }
  return minVersions;
}
