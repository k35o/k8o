'use server';

import { headers } from 'next/headers';

import { findUnknownArteImports } from '@/features/generation/infrastructure/design-system-context';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { previewProvider } from '../application/preview-provider';

// プレビューも課金/環境に関わる操作なので、オーナーゲートを通す。
export const startPreviewSession = async (): Promise<{
  url: string;
} | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  const url = await previewProvider.ensure();
  return { url };
};

export const applyPreviewCode = async (
  code: string,
): Promise<{ ok: true } | { ok: false; error?: string }> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return { ok: false };
  }
  // 存在しない import（幻覚アイコン等）を書き込むと Vite のモジュールが壊れ、
  // 以後プレビューが白画面のまま復帰しない。書き込み前に弾き、エラーを self-heal に回す。
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
