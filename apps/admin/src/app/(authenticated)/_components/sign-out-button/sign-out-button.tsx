'use client';

import { useToast } from '@k8o/arte-odyssey';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

import { authClient } from '@/libs/auth-client';

export const SignOutButton: FC = () => {
  const router = useRouter();
  const { onOpen } = useToast();

  const handleSignOut = () => {
    authClient.signOut({
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
      className="text-fg-mute hover:text-fg-base text-sm transition-colors"
      onClick={handleSignOut}
      type="button"
    >
      ログアウト
    </button>
  );
};
