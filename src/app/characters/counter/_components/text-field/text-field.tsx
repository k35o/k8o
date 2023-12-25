'use client';

import { Textarea } from '@/app/_components/form/textarea';
import { useTextField } from '../../_state/text';
import { TextLength } from '../text-length';
import { useDeferredValue } from 'react';

export const TextField = () => {
  const { text, handleTextChange } = useTextField();
  const deferredText = useDeferredValue(text);

  return (
    <>
    <Textarea
      value={text}
      onChange={handleTextChange}
      placeholder="ここに文字列を入力してください"
      rows={5}
    />
    <div className="flex gap-2">
      <p>文字数：</p>
      <p>
        <TextLength text={deferredText} />
      </p>
    </div>
    </>
  );
};
