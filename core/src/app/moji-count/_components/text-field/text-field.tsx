'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { useDeferredValue, useState } from 'react';
import { TextLength } from '../text-length';

export const TextField = () => {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  return (
    <div className="flex grow flex-col gap-2">
      <div className="h-full *:h-full">
        <FormControl
          label="カウントしたい文字列"
          renderInput={({ labelId: _, ...props }) => {
            return (
              <Textarea
                {...props}
                fullHeight
                isRequired
                onChange={(e) => {
                  setText(e.target.value);
                }}
                placeholder="ここに文字列を入力してください"
                value={text}
              />
            );
          }}
        />
      </div>
      <div className="flex gap-2">
        <p className="text-lg">文字数：</p>
        <p className="font-bold text-xl">
          <TextLength text={deferredText} />
        </p>
      </div>
    </div>
  );
};
