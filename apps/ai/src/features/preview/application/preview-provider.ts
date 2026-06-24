import 'server-only';
import {
  ensureLocalPreview,
  writeLocalPreview,
} from '../infrastructure/local-preview';
import {
  ensureSandboxPreview,
  isSandboxConfigured,
  writeSandboxPreview,
} from '../infrastructure/sandbox-preview';

export type PreviewProvider = {
  ensure: () => Promise<string>;
  apply: (code: string) => Promise<void>;
};

const localProvider: PreviewProvider = {
  ensure: ensureLocalPreview,
  apply: writeLocalPreview,
};

// 本人専用ツールなのでライブプレビューのサンドボックスは固定名1つ（編集中は1つで足りる）。
const PREVIEW_NAME = 'studio-preview';
const sandboxProvider: PreviewProvider = {
  ensure: () => ensureSandboxPreview(PREVIEW_NAME),
  apply: (code) => writeSandboxPreview(PREVIEW_NAME, code),
};

// 本番（Vercel）なら Sandbox。ローカルでも AI_PREVIEW_SANDBOX=true で Sandbox に繋いで
// 検証できる（VERCEL_TOKEN で認証）。どちらも未設定なら手元の Vite dev。
const useSandbox =
  isSandboxConfigured() &&
  (process.env['VERCEL_ENV'] !== undefined ||
    process.env['AI_PREVIEW_SANDBOX'] === 'true');
export const previewProvider: PreviewProvider = useSandbox
  ? sandboxProvider
  : localProvider;
