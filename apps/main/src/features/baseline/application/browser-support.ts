import type { BaselineMinVersions } from '@repo/helpers/browser/detect-browser';

import { features } from '../infrastructure/web-features-source';
import { computeBaselineMinVersions } from './baseline';

// アプリが動作保証する各ブラウザの最低版。全 baseline 機能(newly/widely)の対応版から
// 算出する。webstatus.dev への同期ではなく、ビルド時に web-features から直接求める。
export function getBaselineMinVersions(): BaselineMinVersions {
  return computeBaselineMinVersions(features);
}
