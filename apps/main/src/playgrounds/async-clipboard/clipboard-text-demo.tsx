'use client';

import { Button, FormControl, TextField } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

import styles from './clipboard-text-demo.module.css';

export const ClipboardTextDemo: FC = () => {
  const [text, setText] = useState('');

  return (
    <div className={styles.root}>
      <FormControl
        disabled={false}
        invalid={false}
        required={false}
        label="テキスト"
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <TextField
            onChange={(e) => {
              setText(e.currentTarget.value);
            }}
            value={text}
            {...props}
          />
        )}
      />
      <div className={styles.actions}>
        <Button
          onClick={() => {
            void navigator.clipboard.writeText(text);
          }}
        >
          クリップボードにコピー
        </Button>
        <Button
          onClick={() => {
            void navigator.clipboard.readText().then((pasted) => {
              setText((prev) => prev + pasted);
              return undefined;
            });
          }}
        >
          クリップボードからペースト
        </Button>
      </div>
    </div>
  );
};
