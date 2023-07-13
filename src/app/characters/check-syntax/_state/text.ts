import { RECOIL_KEYS } from '@/constants';
import { atom, selector, useRecoilState } from 'recoil';

export const textState = atom<string>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_TEXT,
  default: '',
});

export const separetedTextState = selector<string[]>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_SEPARATED_TEXT,
  get: ({ get }) => {
    const text = get(textState);
    return text.split('\n');
  },
});

export const useTextField = () => {
  const [text, setText] = useRecoilState(textState);

  return {
    text,
    handleTextChange: (text: string) => {
      setText(text);
    },
  };
};
