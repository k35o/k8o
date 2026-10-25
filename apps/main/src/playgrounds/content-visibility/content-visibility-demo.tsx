'use client';

import { Button, Code } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

import styles from './content-visibility-demo.module.css';

export const ContentVisibilityDemo: FC = () => {
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
          <div className={styles.box}>
            <div
              style={{
                contentVisibility: showHidden ? 'hidden' : 'visible',
              }}
            >
              <h3 className={styles.heading}>サンプルコンテンツ</h3>
              <p className={styles.text}>
                このコンテンツは<Code>content-visibility: hidden</Code>
                によって制御されています。非表示の場合、レンダリング処理が行われず、スクリーンリーダーやブラウザ検索からもアクセスできません。
              </p>
              <Button>
                content-visibilityがhiddenなボタン（何も起きません）
              </Button>
            </div>
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
          <div className={styles.box}>
            <div
              style={{
                contentVisibility: showAuto ? 'auto' : 'visible',
              }}
            >
              <h3 className={styles.heading}>サンプルコンテンツ</h3>
              <p className={styles.text}>
                このコンテンツは<Code>content-visibility: auto</Code>
                によって制御されています。ビューポート外の要素のレンダリング処理を必要なタイミングまでスキップできます。
              </p>
              <Button>
                content-visibilityがautoなボタン（何も起きません）
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
