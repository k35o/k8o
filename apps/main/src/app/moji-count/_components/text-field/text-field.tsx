'use client';

import { FormControl, Textarea } from '@k8o/arte-odyssey';
import { useDeferredValue, useEffect, useState } from 'react';

import { countGraphemeLength } from '../../_utils/count-text';
import { TextLength } from '../text-length';

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
    <div className="flex grow flex-col gap-2">
      <output className="sr-only">{announcement}</output>
      <div className="h-full *:h-full">
        <FormControl
          label="カウントしたい文字列"
          renderInput={({ 'aria-labelledby': _, ...props }) => (
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
      <div className="flex gap-2">
        <p className="text-lg">文字数：</p>
        <p className="text-xl font-bold">
          <TextLength text={deferredText} />
        </p>
      </div>
    </div>
  );
};
