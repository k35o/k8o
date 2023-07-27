'use client';

import { Button } from '@/app/_components/button';
import { checkJapaneseSyntax } from '../../_utils/japaneseSyntax';
import { useRecoilValue } from 'recoil';
import { textState } from '../../_state/text';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/app/_components/accordion';
import { useState } from 'react';
import clsx from 'clsx';

type Result = Record<number, string[]>;

export const CheckedField = () => {
  const [resultMessages, setResultMessages] = useState<Result>([]);
  const [resultText, setResultText] = useState<string[]>([]);
  const text = useRecoilValue(textState);

  const handleCheck = async () => {
    const res = await checkJapaneseSyntax({ text });
    console.log(res);
    setResultText(res.text.split('\n'));
    setResultMessages(
      res.msgs.reduce((acc: Result, cur) => {
        const line = cur.line;
        return {
          ...acc,
          [line]: [...(acc[line] ?? []), cur.message],
        };
      }, []),
    );
  };
  return (
    <>
      <Button onClick={handleCheck} fullWidth>
        チェック
      </Button>
      {resultText.length > 0 && (
        <section
          className="rounded-md bg-white p-4"
          aria-label="結果"
        >
          <h2 className="text-xl font-bold">結果</h2>
          <Accordion>
            {resultText.map((text, idx) => {
              const line = idx + 1;
              const messages = resultMessages[idx + 1];
              if (messages === undefined || messages.length === 0) {
                return (
                  <h3
                    className={clsx(
                      'flex gap-1 px-2',
                      (idx === 0 ||
                        (resultMessages[idx]?.length ?? 0) > 0) &&
                        'border-t',
                    )}
                    key={`${text}_${line}`}
                  >
                    <span className="w-16 flex-shrink-0 bg-green-200 text-center">
                      {line}
                    </span>
                    <p>&nbsp;{text}</p>
                  </h3>
                );
              }
              return (
                <AccordionItem key={`${text}_${line}`}>
                  <h3>
                    <AccordionButton>
                      <div className="flex gap-1">
                        <span className="-my-2 w-16 flex-shrink-0 bg-red-200 text-center">
                          {line}
                        </span>
                        <p className="text-left">&nbsp;{text}</p>
                      </div>
                    </AccordionButton>
                  </h3>
                  <AccordionPanel>
                    {messages.map((message, idx) => {
                      return (
                        <div
                          className="flex gap-1"
                          key={`${message}_${idx}`}
                        >
                          <span className="-my-2 w-16 flex-shrink-0 bg-red-200 text-center" />
                          <span className="text-sm">{message}</span>
                        </div>
                      );
                    })}
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      )}
    </>
  );
};
