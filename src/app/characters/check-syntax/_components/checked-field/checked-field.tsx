'use client';

import { separetedTextState } from '../../_state/text';
import { useRecoilValue } from 'recoil';

export const CheckedField = () => {
  const separetedText = useRecoilValue(separetedTextState);

  return (
    <div className="px-3 py-2 w-full rounded-md border border-gray-300">
      {separetedText.map((line, i) => (
        <p key={line + i}>{line}</p>
      ))}
    </div>
  );
};
