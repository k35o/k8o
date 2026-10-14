'use client';

import { CopyButton } from '@k8ordo/ui';
import type { FC } from 'react';

import type { RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import { toCssText } from '../../_utils/radius-css';

type Props = {
  corners: RadiusCorners;
  shape: CornerShape;
};

export const OutputPanel: FC<Props> = ({ corners, shape }) => {
  const css = toCssText(corners, shape);

  return (
    <div className="bg-bg-subtle flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl px-4 py-3">
      <code className="text-fg-base font-mono text-sm break-all whitespace-pre-line">
        {css}
      </code>
      <div className="flex flex-wrap gap-2">
        <CopyButton label="CSSをコピー" size="sm" value={css} />
        <CopyButton
          label="共有用URLをコピー"
          size="sm"
          value={() => window.location.href}
        />
      </div>
    </div>
  );
};
