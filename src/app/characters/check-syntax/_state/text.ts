import { RECOIL_KEYS } from '@/constants';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

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

export const resultTextState = atom<string[]>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_RESULT_TEXT,
  default: [],
});

export type ResultMessage = Record<number, string[]>;

export const resultMessagesState = atom<ResultMessage>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_RESULT_MESSAGES,
  default: {},
});

export const useStatus = ():
  | { isExecuted: false }
  | { isExecuted: true; hasError: boolean } => {
  const resultText = useRecoilValue(resultTextState);
  const resultMessages = useRecoilValue(resultMessagesState);

  if (resultText.length === 0) {
    return {
      isExecuted: false,
    };
  }

  if (Object.keys(resultMessages).length === 0) {
    return {
      isExecuted: true,
      hasError: false,
    };
  }

  return {
    isExecuted: true,
    hasError: true,
  };
};

export const useResetResult = () => {
  const setResultText = useSetRecoilState(resultTextState);
  const setResultMessages = useSetRecoilState(resultMessagesState);

  return () => {
    setResultText([]);
    setResultMessages({});
  };
};
