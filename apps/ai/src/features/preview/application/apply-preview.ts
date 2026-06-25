import 'server-only';
import { findUnknownArteImports } from '@/features/generation/infrastructure/design-system-context';

import { previewProvider } from './preview-provider';

export type ApplyPreviewResult = { ok: true } | { ok: false; error?: string };

// 生成／読込コードをプレビュー（Sandbox）へ反映する中核。auth は呼び出し側で済ませる前提。
// 存在しない import を書き込むと Vite が壊れ白画面のまま復帰しないため、書込前に弾く。
export const applyStudioPreviewCode = async (
  code: string,
): Promise<ApplyPreviewResult> => {
  const unknown = findUnknownArteImports(code);
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `'@k8o/arte-odyssey' に存在しない import: ${unknown.join(', ')}。これらは実在しないため使用できません。`,
    };
  }
  await previewProvider.apply(code);
  return { ok: true };
};
