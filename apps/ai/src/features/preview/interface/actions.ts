'use server';

import { headers } from 'next/headers';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { applyStudioPreviewCode } from '../application/apply-preview';
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
  return applyStudioPreviewCode(code);
};
