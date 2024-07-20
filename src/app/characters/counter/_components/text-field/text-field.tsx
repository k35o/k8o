'use client';

import { Textarea } from '@/components/form/textarea';
import { useTextField } from '../../_state/text';
import { TextLength } from '../text-length';
import { useDeferredValue } from 'react';
import { FormControl } from '@/components/form/form-control/form-control';

export const TextField = () => {
  const { text, handleTextChange } = useTextField();
  const deferredText = useDeferredValue(text);

  return (
    <div className="flex-grow">
      <div className="h-full *:h-full">
        <FormControl
          label="カウントしたい文字列"
          renderInput={(props) => {
            return (
              <Textarea
                {...props}
                value={text}
                onChange={handleTextChange}
                placeholder="ここに文字列を入力してください"
                fullHeight
                isRequired
              />
            );
          }}
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
