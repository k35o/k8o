'use client';

import { FormControl, TextField } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './contrast-color-demo.module.css';

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/u.test(value);

export function ContrastColorDemo() {
  const [backgroundColor, setBackgroundColor] = useState('#2563eb');

  return (
    <div className={styles.root}>
      <FormControl
        label="背景色"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <div className={styles.picker}>
            <label
              className={styles.swatch}
              style={{
                backgroundColor: isHexColor(backgroundColor)
                  ? backgroundColor
                  : '#2563eb',
              }}
            >
              <input
                aria-label="カラーピッカー"
                className={styles.colorInput}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                }}
                type="color"
                value={
                  isHexColor(backgroundColor) ? backgroundColor : '#2563eb'
                }
              />
            </label>
            <TextField
              onChange={(e) => {
                setBackgroundColor(e.currentTarget.value);
              }}
              value={backgroundColor}
              {...props}
            />
          </div>
        )}
      />

      <div
        className={styles.preview}
        style={{
          backgroundColor,
          color: `contrast-color(${backgroundColor})`,
        }}
      >
        この文字色は contrast-color() で決まっています
      </div>

      <p className={styles.code}>
        color: contrast-color({backgroundColor})&#x3B;
      </p>
    </div>
  );
}
