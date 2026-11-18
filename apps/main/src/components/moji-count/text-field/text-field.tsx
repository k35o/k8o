'use client';

import { FormControl, Textarea } from '@k8ordo/ui';
import { useDeferredValue, useState } from 'react';

import { DebouncedAnnouncement } from '@/components/site/debounced-announcement/debounced-announcement';

import { countGraphemeLength } from '../count-text/count-text';
import { TextLength } from '../text-length/text-length';

import styles from './text-field.module.css';

export const TextField = () => {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  return (
    <div className={styles.root}>
      {/* 未入力のときは読み上げない（初期マウントで「0文字」が鳴るのを避ける） */}
      <DebouncedAnnouncement
        message={
          text === '' ? '' : `${countGraphemeLength(text).toString()}文字`
        }
      />
      <div className={styles.field}>
        <FormControl
          label="カウントしたい文字列"
          renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
            <Textarea
              {...props}
              fullHeight
              onChange={(e) => {
                setText(e.target.value);
              }}
              placeholder="ここに文字列を入力してください"
              required
              value={text}
            />
          )}
        />
      </div>
      <div className={styles.result}>
        <p className={styles.resultLabel}>文字数：</p>
        <p className={styles.resultValue}>
          <TextLength text={deferredText} />
        </p>
      </div>
    </div>
  );
};
