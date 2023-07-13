'use client';

import { Textarea } from '@/app/_components/form/textarea';
import { useTextField } from '../../_state/text';

export const TextField = () => {
  const { text, handleTextChange } = useTextField();

  return (
    <Textarea
      value={text}
      onChange={handleTextChange}
      placeholder="ここに文字列を入力してください"
      rows={5}
    />
  );
};
