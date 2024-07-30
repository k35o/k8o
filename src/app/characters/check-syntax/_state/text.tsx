'use client';

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
export type ResultMessage = Record<number, string[]>;

const TextContext = createContext<string | undefined>(undefined);

const SetTextContext = createContext<Setter<string> | undefined>(
  undefined,
);

const ResultTextContext = createContext<string[] | undefined>(
  undefined,
);

const SetResultTextContext = createContext<
  Setter<string[]> | undefined
>(undefined);

const ResultMessagesContext = createContext<
  Record<number, string[]> | undefined
>(undefined);

const SetResultTextMessagesContext = createContext<
  Setter<Record<number, string[]>> | undefined
>(undefined);

const FixTextContext = createContext<
  Record<number, string> | undefined
>(undefined);

const SetFixTextContext = createContext<
  Setter<Record<number, string>> | undefined
>(undefined);

const CompleteContext = createContext<boolean | undefined>(undefined);

const SetCompleteContext = createContext<Setter<boolean> | undefined>(
  undefined,
);

export const useText = (): string => {
  const text = useContext(TextContext);

  if (text === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return text;
};

export const useSetText = (): Setter<string> => {
  const setText = useContext(SetTextContext);

  if (setText === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return setText;
};

export const useResultText = (): string[] => {
  const text = useContext(ResultTextContext);

  if (text === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return text;
};

export const useSetResultText = (): Setter<string[]> => {
  const setText = useContext(SetResultTextContext);

  if (setText === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return setText;
};

const useResultMessages = (): ResultMessage => {
  const text = useContext(ResultMessagesContext);

  if (text === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return text;
};

export const useSetResultMessages = (): Setter<ResultMessage> => {
  const setText = useContext(SetResultTextMessagesContext);

  if (setText === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return setText;
};

const useFixTexts = (): Record<number, string> => {
  const text = useContext(FixTextContext);

  if (text === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return text;
};

export const useSetFixTexts = (): Setter<Record<number, string>> => {
  const setText = useContext(SetFixTextContext);

  if (setText === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return setText;
};

const useComplete = (): boolean => {
  const text = useContext(CompleteContext);

  if (text === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return text;
};

const useSetComplete = (): Setter<boolean> => {
  const setText = useContext(SetCompleteContext);

  if (setText === undefined) {
    throw Error('useText must be used within a TextProvider');
  }

  return setText;
};

// TODO: テストのためのデータの挿入方法を考える
export const CheckSyntaxProvider: FC<
  PropsWithChildren<{
    __test?: {
      defaultText?: string;
      defaultResultText?: string[];
      defaultResultMessages?: ResultMessage;
      defaultFixTexts?: Record<number, string>;
    };
  }>
> = ({ children, __test }) => {
  const [text, setText] = useState(
    __test?.defaultText ? __test.defaultText : '',
  );
  const [resultText, setResultText] = useState<string[]>(
    __test?.defaultResultText ? __test.defaultResultText : [],
  );
  const [resultMessages, setResultMessages] = useState<ResultMessage>(
    __test?.defaultResultMessages ? __test.defaultResultMessages : {},
  );
  const [fixTexts, setFixTexts] = useState<Record<number, string>>(
    __test?.defaultFixTexts ? __test.defaultFixTexts : {},
  );
  const [complete, setComplete] = useState(false);

  return (
    <TextContext.Provider value={text}>
      <SetTextContext.Provider value={setText}>
        <ResultTextContext.Provider value={resultText}>
          <SetResultTextContext.Provider value={setResultText}>
            <ResultMessagesContext.Provider value={resultMessages}>
              <SetResultTextMessagesContext.Provider
                value={setResultMessages}
              >
                <FixTextContext.Provider value={fixTexts}>
                  <SetFixTextContext.Provider value={setFixTexts}>
                    <CompleteContext.Provider value={complete}>
                      <SetCompleteContext.Provider
                        value={setComplete}
                      >
                        {children}
                      </SetCompleteContext.Provider>
                    </CompleteContext.Provider>
                  </SetFixTextContext.Provider>
                </FixTextContext.Provider>
              </SetResultTextMessagesContext.Provider>
            </ResultMessagesContext.Provider>
          </SetResultTextContext.Provider>
        </ResultTextContext.Provider>
      </SetTextContext.Provider>
    </TextContext.Provider>
  );
};

export const useFixedText = (): string => {
  const resultText = useResultText();
  const fixTexts = useFixTexts();

  return resultText.reduce((acc, text, index) => {
    const fixedText = fixTexts[index];
    const separator = index === 0 ? '' : '\n';
    if (fixedText === undefined) {
      return acc + separator + text;
    }
    if (fixedText === '') {
      return acc;
    }
    return acc + separator + fixedText;
  }, '');
};

export const useSetFixTextsField = (
  count: number,
  originalText: string,
) => {
  const fixTexts = useFixTexts();
  const setFixTexts = useSetFixTexts();
  const fixText = fixTexts[count] ?? originalText;

  return {
    fixText,
    handleFixTextChange: (text: string) => {
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
  const resultText = useResultText();
  const resultMessages = useResultMessages();
  const complete = useComplete();

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
  const resultMessages = useResultMessages();

  return Object.keys(resultMessages).length;
};

export const useInvalidResult = (count: number) => {
  const resultText = useResultText();
  const resultMessages = useResultMessages();
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

export const useConvertComplete = () => {
  const setComplete = useSetComplete();

  return useCallback(() => {
    setComplete(true);
  }, [setComplete]);
};

export const useConvertIncomplete = () => {
  const setComplete = useSetComplete();

  return () => {
    setComplete(false);
  };
};

export const useResetResult = () => {
  const setResultText = useSetResultText();
  const setResultMessages = useSetResultMessages();
  const setFixTexts = useSetFixTexts();
  const setComplete = useSetComplete();

  return () => {
    setResultText([]);
    setResultMessages({});
    setFixTexts({});
    setComplete(false);
  };
};
