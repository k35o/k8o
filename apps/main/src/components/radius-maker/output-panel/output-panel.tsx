'use client';

import { CopyButton } from '@k8ordo/ui';
import type { FC } from 'react';

import type { RadiusCorners } from '../corner-radius/corner-radius';
import type { CornerShape } from '../corner-shape/corner-shape';
import { toCssText } from '../radius-css/radius-css';

import styles from './output-panel.module.css';

type Props = {
  corners: RadiusCorners;
  shape: CornerShape;
};

export const OutputPanel: FC<Props> = ({ corners, shape }) => {
  const css = toCssText(corners, shape);

  return (
    <div className={styles.root}>
      <code className={styles.code}>{css}</code>
      <div className={styles.actions}>
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
