'use client';

import { Spinner, useToast } from '@k8o/arte-odyssey';
import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { authClient } from '@/shared/auth/auth-client';

export const SignOutButton: FC = () => {
  const router = useRouter();
  const { onOpen } = useToast();
  // signOut は fetchOptions のコールバック方式で promise を待てないため、useState で
  // 押下直後に保留中を出す。成功時は遷移して unmount するので解除は失敗時のみ。
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = () => {
    setIsPending(true);
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in');
          router.refresh();
        },
        onError: () => {
          setIsPending(false);
          onOpen('error', 'ログアウトに失敗しました');
        },
      },
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
