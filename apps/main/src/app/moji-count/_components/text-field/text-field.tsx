'use client';

import { FormControl, Textarea } from '@k8ordo/ui';
import { useDeferredValue, useEffect, useState } from 'react';

import { countGraphemeLength } from '../../_utils/count-text';
import { TextLength } from '../text-length';

import styles from './text-field.module.css';

export const TextField = () => {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  // タイピング中は入力の都度カウントが変わるため、読み上げはデバウンスして
  // 入力が落ち着いてから最新の文字数だけをスクリーンリーダーに通知する。
  // 未入力時は読み上げない（初期マウントで「0文字」が鳴るのを避ける）
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      if (text !== '') {
        setAnnouncement(`${countGraphemeLength(text).toString()}文字`);
      }
    }, 500);
    return () => {
      clearTimeout(id);
    };
  }, [text]);

  return (
    <div className={styles.root}>
      <output className={styles.srOnly}>{announcement}</output>
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
