'use client';

import { FormControl, NumberField } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';

import styles from './root-comparison-demo.module.css';

export function RootComparisonDemo() {
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className={styles.root}>
      <FormControl
        helpText="8px〜48pxの範囲で変更できます"
        label="font-size"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <div className={styles.field}>
            <NumberField
              max={48}
              min={8}
              onChange={(value) => {
                if (value !== null) setFontSize(value);
              }}
              step={1}
              value={fontSize}
              {...props}
            />
            <span className={styles.unit}>px</span>
          </div>
        )}
      />

      <div className={styles.samples}>
        <div style={{ fontSize: `${fontSize}px` }}>
          <div className={styles.row}>
            <span className={cn(styles.caption, styles.unitName)}>1ch</span>
            <div className={styles.ruler}>
              <span style={{ lineHeight: 1 }}>0</span>
              <div
                className={cn(styles.bar, styles.ch)}
                style={{ width: '1ch' }}
              />
            </div>
            <span className={styles.caption}>基準: {fontSize}px</span>
          </div>
        </div>

        <div>
          <div className={styles.row}>
            <span className={cn(styles.caption, styles.unitName)}>1rch</span>
            <div className={styles.ruler}>
              <span style={{ lineHeight: 1 }}>0</span>
              <div
                className={cn(styles.bar, styles.rch)}
                style={{ width: '1rch' }}
              />
            </div>
            <span className={styles.caption}>基準: 16px</span>
          </div>
        </div>
      </div>

      <p className={styles.note}>
        font-sizeの値を変更してみてください。chは親要素のfont-sizeに連動してサイズが変わりますが、rchは常にルート要素（16px）を基準にするため同じサイズです。
        <br />
        ブラウザの文字サイズ設定を変更している場合、正しく動作しないことがあります。
      </p>
    </div>
  );
}
