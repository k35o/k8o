'use client';

import {
  Button,
  CopyIcon,
  LinkIcon,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import { toCssText } from '../../_utils/radius-css';

type Props = {
  corners: RadiusCorners;
  shape: CornerShape;
};

export const OutputPanel: FC<Props> = ({ corners, shape }) => {
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const css = toCssText(corners, shape);

  const handleCopyCss = async () => {
    try {
      await writeClipboard(css);
      onOpen('success', 'CSSをコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await writeClipboard(window.location.href);
      onOpen('success', '共有用URLをコピーしました');
    } catch {
      onOpen('error', 'コピーに失敗しました');
    }
  };

  return (
    <div className="bg-bg-subtle flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl px-4 py-3">
      <code className="text-fg-base font-mono text-sm break-all whitespace-pre-line">
        {css}
      </code>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            void handleCopyCss();
          }}
          size="sm"
          startIcon={<CopyIcon size="sm" />}
          variant="outline"
        >
          CSSをコピー
        </Button>
        <Button
          onClick={() => {
            void handleCopyUrl();
          }}
          size="sm"
          startIcon={<LinkIcon size="sm" />}
          variant="outline"
        >
          共有用URLをコピー
        </Button>
      </div>
    </div>
  );
};
