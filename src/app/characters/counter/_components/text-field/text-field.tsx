'use client';

import { Textarea } from '@/components/form/textarea';
import { TextLength } from '../text-length';
import { useDeferredValue, useState } from 'react';
import { FormControl } from '@/components/form/form-control';

export const TextField = () => {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  return (
    <div className="grow">
      <div className="h-full *:h-full">
        <FormControl
          label="カウントしたい文字列"
          renderInput={(props) => {
            return (
              <Textarea
                {...props}
                value={text}
                onChange={setText}
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
