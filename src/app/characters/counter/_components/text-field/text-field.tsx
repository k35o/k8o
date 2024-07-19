'use client';

import { Textarea } from '@/components/form/textarea';
import { useTextField } from '../../_state/text';
import { TextLength } from '../text-length';
import { useDeferredValue, useId } from 'react';

export const TextField = () => {
  const id = useId();
  const { text, handleTextChange } = useTextField();
  const deferredText = useDeferredValue(text);

  return (
    <div className="flex-grow">
      <fieldset className="flex h-full flex-col gap-2">
        <label className="font-bold" htmlFor={id}>
          カウントしたい文字列
        </label>
        <Textarea
          id={id}
          value={text}
          onChange={handleTextChange}
          placeholder="ここに文字列を入力してください"
          fullHeight
        />
      </fieldset>
      <div className="flex gap-2">
        <p className="text-lg">文字数：</p>
        <p className="text-xl font-bold">
          <TextLength text={deferredText} />
        </p>
      </div>
    </div>
  );
};
