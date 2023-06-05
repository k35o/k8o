import { RECOIL_KEYS } from '@/constants';
import { ChangeEvent } from 'react';
import { atom, useRecoilState } from 'recoil';

export const textState = atom<string>({
  key: RECOIL_KEYS.CHARACTERS_COUNTER_TEXT,
  default: '',
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
