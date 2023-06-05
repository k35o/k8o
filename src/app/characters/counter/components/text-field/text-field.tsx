'use client';

import { useTextField } from '../../state/text';

export const TextField = () => {
  const { text, handleTextChange } = useTextField();

  return (
    <textarea
      value={text}
      onChange={handleTextChange}
      className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="ここに文字列を入力してください"
      rows={5}
    />
  );
};
