'use client';

import { Button, useToast } from '@k8ordo/ui';
import type { FC } from 'react';

import { authClient } from './auth-client';

export const SignOutButton: FC = () => {
  const { open } = useToast();

  const handleSignOut = async (): Promise<void> => {
    // 通信の失敗は error を返さず例外になるため、HTTP のエラーも例外にそろえて受ける
    try {
      await authClient.signOut({ fetchOptions: { throw: true } });
    } catch {
      open('error', 'ログアウトに失敗しました');
      return;
    }
    // ルーターのクライアントキャッシュにはセッション入りの画面が残るため、
    // クライアント遷移ではなく読み直して捨てる
    window.location.replace('/sign-in');
  };

  return (
    <Button color="base" onAction={handleSignOut} size="sm" variant="skeleton">
      ログアウト
    </Button>
  );
};
