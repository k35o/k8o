import { RECOIL_KEYS } from '@/constants';
import { ChangeEvent } from 'react';
import { atom, selector, useRecoilState } from 'recoil';

export const textState = atom<string>({
  key: RECOIL_KEYS.CHARACTERS_COUNTER_TEXT,
  default: '',
});

export const textLengthState = selector<number>({
  key: RECOIL_KEYS.CHARACTERS_COUNTER_TEXT_LENGTH,
  get: ({ get }) => {
    const text = get(textState);
    const segmenter = new Intl.Segmenter('ja', {
      granularity: 'grapheme',
    });
    return [...segmenter.segment(text)].length;
  },
});

export const useTextField = () => {
  const [text, setText] = useRecoilState(textState);

  return {
    text,
    handleTextChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
  };
};