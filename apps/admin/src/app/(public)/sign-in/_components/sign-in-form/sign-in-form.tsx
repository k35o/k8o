'use client';

import { GitHubIcon, useToast } from '@k8o/arte-odyssey';
import type { FC } from 'react';
import { authClient } from '@/shared/auth/auth-client';

export const SignInForm: FC = () => {
  const { onOpen } = useToast();

  const handleSignIn = () => {
    authClient.signIn.social({
      provider: 'github',
      callbackURL: '/',
      fetchOptions: {
        onError: () => {
          onOpen('error', 'ログインに失敗しました');
        },
      },
    });
  };

  return (
    <button
      className="flex items-center gap-3 rounded-full bg-fg-base px-6 py-3 font-medium text-bg-base text-sm transition-opacity hover:opacity-80"
      onClick={handleSignIn}
      type="button"
    >
      <GitHubIcon size="md" />
      GitHubでログイン
    </button>
  );
};
