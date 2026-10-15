'use client';

import { PaletteIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { CSSProperties, FC } from 'react';

import type { RadiusCorners } from '../../_types/corner-radius';
import type { CornerShape } from '../../_types/corner-shape';
import { toBorderRadiusValue } from '../../_utils/radius-css';

import styles from './ui-preview.module.css';

type Props = {
  corners: RadiusCorners;
  shape: CornerShape;
};

export const UiPreview: FC<Props> = ({ corners, shape }) => {
  const radiusStyle: CSSProperties = {
    borderRadius: toBorderRadiusValue(corners),
    cornerShape: shape === 'round' ? undefined : shape,
  };

  return (
    <div className={styles.root}>
      <p className={styles.title}>実際のUIで確認する</p>
      <div className={styles.samples}>
        <figure className={styles.sample}>
          <div aria-hidden="true" className={styles.avatar} style={radiusStyle}>
            k8
          </div>
          <figcaption className={styles.caption}>アバター</figcaption>
        </figure>
        <figure className={styles.sample}>
          <div aria-hidden="true" className={styles.button} style={radiusStyle}>
            ボタン
          </div>
          <figcaption className={styles.caption}>ボタン</figcaption>
        </figure>
        <figure className={styles.sample}>
          <div aria-hidden="true" className={styles.card} style={radiusStyle}>
            <div className={cn(styles.line, styles.lineTitle)} />
            <div className={cn(styles.line, styles.lineBody)} />
            <div className={cn(styles.line, styles.lineTail)} />
          </div>
          <figcaption className={styles.caption}>カード</figcaption>
        </figure>
        <figure className={styles.sample}>
          <div aria-hidden="true" className={styles.image} style={radiusStyle}>
            <PaletteIcon />
          </div>
          <figcaption className={styles.caption}>画像</figcaption>
        </figure>
      </div>
      <p className={styles.note}>
        %指定の角丸は要素の縦横比によって見え方が変わります。
      </p>
    </div>
  );
};
