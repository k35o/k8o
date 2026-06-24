import 'server-only';
import {
  ensureLocalPreview,
  writeLocalPreview,
} from '../infrastructure/local-preview';
import {
  ensureSandboxPreview,
  isSandboxMode,
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

// Sandbox モード（本番、またはローカルで AI_PREVIEW_SANDBOX=true）なら Sandbox、
// それ以外は手元の Vite dev。
export const previewProvider: PreviewProvider = isSandboxMode()
  ? sandboxProvider
  : localProvider;
