import { RECOIL_KEYS } from '@/constants';
import { atom, useRecoilState } from 'recoil';

export const textState = atom<string>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_TEXT,
  default: '',
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
