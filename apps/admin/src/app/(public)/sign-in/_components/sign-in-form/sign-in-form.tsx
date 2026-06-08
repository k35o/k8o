'use client';

import { Button, GitHubIcon, useToast } from '@k8o/arte-odyssey';
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
    <Button
      color="gray"
      fullWidth
      onClick={handleSignIn}
      startIcon={<GitHubIcon size="md" />}
      variant="solid"
    >
      GitHubでログイン
    </Button>
  );
};
