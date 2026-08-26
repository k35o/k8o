'use client';

import { Spinner, useToast } from '@k8o/arte-odyssey';
import { authClient } from '@repo/auth-shell/auth-client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { FC } from 'react';

export const SignOutButton: FC = () => {
  const router = useRouter();
  const { open } = useToast();
  // router.push もトランジション内で呼ぶため、isPending は /sign-in の描画完了まで続く
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      // ネットワーク断では signOut が例外を投げ、transition 経由で error boundary
      // に乗ってしまうため、ここで受け止めてトーストに変える。
      try {
        const { error } = await authClient.signOut();
        if (error) {
          open('error', 'ログアウトに失敗しました');
          return;
        }
      } catch {
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
