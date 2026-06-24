import 'server-only';
import {
  ensureSandboxPreview,
  writeSandboxPreview,
} from '../infrastructure/sandbox-preview';

export type PreviewProvider = {
  ensure: () => Promise<string>;
  apply: (code: string) => Promise<void>;
};

// 本人専用ツールなのでライブプレビューのサンドボックスは固定名1つ（編集中は1つで足りる）。
const PREVIEW_NAME = 'studio-preview';

// プレビューは常に Vercel Sandbox（ローカルも本番も同じ経路）。要 AI_TEMPLATE_SNAPSHOT_ID。
export const previewProvider: PreviewProvider = {
  ensure: () => ensureSandboxPreview(PREVIEW_NAME),
  apply: (code) => writeSandboxPreview(PREVIEW_NAME, code),
};
