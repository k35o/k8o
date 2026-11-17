'use client';

import { Button, Code } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

import { useDemoHeading } from '../demo-heading';

import styles from './content-visibility-demo.module.css';

export const ContentVisibilityDemo: FC = () => {
  const Heading = useDemoHeading();
  const [showHidden, setShowHidden] = useState(true);
  const [showAuto, setShowAuto] = useState(true);

  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <p className={styles.label}>
              <Code>content-visibility: hidden</Code>
            </p>
            <Button
              onClick={() => {
                setShowHidden(!showHidden);
              }}
              size="sm"
            >
              {showHidden ? 'visible' : 'hidden'}に変更する
            </Button>
          </div>
          <div
            className={styles.box}
            style={{
              contentVisibility: showHidden ? 'hidden' : 'visible',
            }}
          >
            <Heading className={styles.heading}>サンプルコンテンツ</Heading>
            <p>
              この見出しと文が、<Code>content-visibility</Code>
              で描かれたり省かれたりする中身です。
            </p>
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <p className={styles.label}>
              <Code>content-visibility: auto</Code>
            </p>
            <Button
              onClick={() => {
                setShowAuto(!showAuto);
              }}
              size="sm"
            >
              {showAuto ? 'visible' : 'auto'}に変更する
            </Button>
          </div>
          <div
            className={styles.box}
            style={{
              contentVisibility: showAuto ? 'auto' : 'visible',
            }}
          >
            <Heading className={styles.heading}>サンプルコンテンツ</Heading>
            <p>
              この見出しと文が、<Code>content-visibility</Code>
              で描かれたり省かれたりする中身です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
