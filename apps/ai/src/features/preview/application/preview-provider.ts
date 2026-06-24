import 'server-only';
import {
  ensureLocalPreview,
  writeLocalPreview,
} from '../infrastructure/local-preview';

export type PreviewProvider = {
  ensure: () => Promise<string>;
  apply: (code: string) => Promise<void>;
};

const localProvider: PreviewProvider = {
  ensure: ensureLocalPreview,
  apply: writeLocalPreview,
};

// TODO(本番): VERCEL_ENV のとき Vercel Sandbox provider に切り替える。
export const previewProvider: PreviewProvider = localProvider;
