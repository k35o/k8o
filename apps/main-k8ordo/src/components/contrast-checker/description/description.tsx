import { Anchor } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './description.module.css';

export const Description: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <div className={styles.section}>
        <p className={styles.title}>
          <Anchor href="https://www.w3.org/TR/WCAG22/">WCAG 2.2</Anchor>
          によるコントラスト比の基準
        </p>
        <div className={styles.criteria}>
          <div className={styles.criterion}>
            <p className={styles.criterionName}>AA基準</p>
            <p className={styles.text}>
              文字のコントラスト比が最低でも4.5:1、大文字の場合は3:1
            </p>
          </div>
          <div className={styles.criterion}>
            <p className={styles.criterionName}>AAA基準</p>
            <p className={styles.text}>
              文字のコントラスト比が最低でも7:1、大文字の場合は4.5:1
            </p>
          </div>
          <p className={styles.note}>
            大文字とは18pt（24px）以上、太字の場合は14pt（18.66px）以上を指します。
          </p>
        </div>
      </div>
      <div className={styles.section}>
        <p className={styles.title}>
          <Anchor href="https://git.apcacontrast.com/">APCA</Anchor>
          によるコントラストの基準
        </p>
        <div className={styles.criteria}>
          <p className={styles.text}>
            APCA（Accessible Perceptual Contrast Algorithm）は、WCAG
            3で検討されている人間の知覚に基づくコントラスト指標です。
            コントラストの強さをLc値（0〜±108程度）で表し、正の値は明るい背景に暗い文字、負の値は暗い背景に明るい文字を意味します。
            判定にはLc値の絶対値を使い、本文テキストはLc
            75以上、見出しなど大きなテキストはLc 45以上が目安です。
          </p>
          <p className={styles.note}>
            APCAは策定中の指標のため、基準値は今後変わる可能性があります。
          </p>
        </div>
      </div>
    </div>
  </div>
);
