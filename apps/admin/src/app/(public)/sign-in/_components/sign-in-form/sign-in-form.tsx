'use client';

import { GitHubIcon, useToast } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { authClient } from '@/shared/auth/auth-client';

export const SignInForm: FC = () => {
  const { onOpen } = useToast();

  const handleSignIn = () => {
    void authClient.signIn.social({
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
      className="bg-fg-base text-bg-base flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
      onClick={handleSignIn}
      type="button"
    >
      <GitHubIcon size="md" />
      GitHubでログイン
    </button>
  );
};
