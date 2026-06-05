'use client';

import { useToast } from '@k8o/arte-odyssey';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

import { authClient } from '@/shared/auth/auth-client';

export const SignOutButton: FC = () => {
  const router = useRouter();
  const { onOpen } = useToast();

  const handleSignOut = () => {
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in');
          router.refresh();
        },
        onError: () => {
          onOpen('error', 'ログアウトに失敗しました');
        },
      },
    });
  };

  return (
    <button
      className="text-fg-mute hover:bg-bg-mute hover:text-fg-base flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
      onClick={handleSignOut}
      type="button"
    >
      ログアウト
    </button>
  );
};
