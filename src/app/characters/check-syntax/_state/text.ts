import { RECOIL_KEYS } from '@/constants';
import { useState } from 'react';
import {
  atom,
  selector,
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

const fixTextsState = atom<Record<number, string>>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_FIX_TEXTS,
  default: {},
});

const completeState = atom<boolean>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_COMPLETE,
  default: false,
});

export const fixedTextState = selector<string>({
  key: RECOIL_KEYS.CHARACTERS_CHECK_SYNTAX_FIXED_TEXT,
  get: ({ get }) => {
    const resultText = get(resultTextState);
    const fixTexts = get(fixTextsState);
    return resultText.reduce((acc, text, index) => {
      const fixedText = fixTexts[index];
      if (fixedText === undefined) {
        return acc + '\n' + text;
      }
      if (fixedText === '') {
        return acc;
      }
      return acc + '\n' + fixedText;
    }, '');
  },
});

export const useSetFixTextsField = (
  count: number,
  originalText: string,
) => {
  const [fixTexts, setFixTexts] = useRecoilState(fixTextsState);
  const [fixText, setFixText] = useState(
    fixTexts[count] ?? originalText,
  );

  return {
    fixText,
    handleFixTextChange: (text: string) => {
      setFixText(text);
      setFixTexts((prev) => {
        return {
          ...prev,
          [count]: text,
        };
      });
    },
  };
};

export const useStatus = ():
  | { isExecuted: false }
  | { isExecuted: true; hasError: false }
  | { isExecuted: true; hasError: true; isComplete: boolean } => {
  const resultText = useRecoilValue(resultTextState);
  const resultMessages = useRecoilValue(resultMessagesState);
  const complete = useRecoilValue(completeState);

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
    isComplete: complete,
  };
};

export const useInvalidCount = () => {
  const resultMessages = useRecoilValue(resultMessagesState);

  return Object.keys(resultMessages).length;
};

export const useInvalidResult = (count: number) => {
  const resultText = useRecoilValue(resultTextState);
  const resultMessages = useRecoilValue(resultMessagesState);
  const messagesKey = Number(Object.keys(resultMessages)[count - 1]);

  const resultIdx = messagesKey - 1;
  const text = resultText[resultIdx];
  const message = resultMessages[messagesKey];
  if (text === undefined || message === undefined) {
    throw Error('Invalid result');
  }

  return {
    resultText: text,
    resultMessage: message,
    resultIdx,
  };
};

export const useIsCheckResult = () => {
  const setComplete = useSetRecoilState(completeState);

  return () => {
    setComplete(true);
  };
};

export const useIsBackSyntaxFixer = () => {
  const setComplete = useSetRecoilState(completeState);

  return () => {
    setComplete(false);
  };
};

export const useResetResult = () => {
  const setResultText = useSetRecoilState(resultTextState);
  const setResultMessages = useSetRecoilState(resultMessagesState);
  const setFixTexts = useSetRecoilState(fixTextsState);
  const setComplete = useSetRecoilState(completeState);

  return () => {
    setResultText([]);
    setResultMessages({});
    setFixTexts({});
    setComplete(false);
  };
};
