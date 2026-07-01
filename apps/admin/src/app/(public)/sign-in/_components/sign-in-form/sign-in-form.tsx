'use client';

import { Button, GitHubIcon, Spinner, useToast } from '@k8o/arte-odyssey';
import { type FC, useState } from 'react';

import { authClient } from '@/shared/auth/auth-client';

export const SignInForm: FC = () => {
  const { onOpen } = useToast();
  // social ログインは GitHub への全画面リダイレクト。押下からリダイレクトまでの間が
  // 無反応に見えるため、保留中はボタンを無効化してスピナーを出す。失敗時のみ解除する。
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = () => {
    setIsPending(true);
    void authClient.signIn.social({
      provider: 'github',
      callbackURL: '/',
      fetchOptions: {
        onError: () => {
          setIsPending(false);
          onOpen('error', 'ログインに失敗しました');
        },
      },
    });
  };

  return (
    <Button
      color="gray"
      disabled={isPending}
      fullWidth
      onClick={handleSignIn}
      startIcon={
        isPending ? (
          <Spinner label="ログイン中" size="sm" />
        ) : (
          <GitHubIcon size="md" />
        )
      }
      variant="solid"
    >
      {isPending ? 'ログイン中…' : 'GitHubでログイン'}
    </Button>
  );
};
