'use client';

import {
  CopyIcon,
  IconButton,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

type CopyCodeButtonProps = {
  code: string | null;
};

// コピー対象はハイライト済み DOM ではなく生の code 文字列（span 分割や空行の \n の影響を避ける）。
export const CopyCodeButton: FC<CopyCodeButtonProps> = ({ code }) => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = async (): Promise<void> => {
    if (code === null) {
      return;
    }
    try {
      await writeClipboard(code);
      onOpen('success', 'コードをコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <IconButton
      color="base"
      disabled={code === null}
      label="コードをコピー"
      onAction={handleCopy}
      size="sm"
    >
      <CopyIcon size="sm" />
    </IconButton>
  );
};
