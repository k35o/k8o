'use client';

import { Spinner, useToast } from '@k8o/arte-odyssey';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { FC } from 'react';

import { authClient } from '@/shared/auth/auth-client';

export const SignOutButton: FC = () => {
  const router = useRouter();
  const { open } = useToast();
  // router.push もトランジション内で呼ぶため、isPending は /sign-in の描画完了まで続く
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const { error } = await authClient.signOut();
      if (error) {
        open('error', 'ログアウトに失敗しました');
        return;
      }
      router.push('/sign-in');
      router.refresh();
    });
  };

  return (
    <button
      className="text-fg-mute hover:bg-bg-mute hover:text-fg-base flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
    >
      {isPending ? <Spinner label="ログアウト中" size="sm" /> : null}
      {isPending ? 'ログアウト中…' : 'ログアウト'}
    </button>
  );
};
