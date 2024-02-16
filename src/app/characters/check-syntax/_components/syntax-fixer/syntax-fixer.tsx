'use client';

import { FC, Fragment, useId } from 'react';
import {
  resultTextState,
  useInvalidCount,
  useInvalidResult,
  useIsCheckResult,
  useResetResult,
  useSetFixTextsField,
} from '../../_state/text';
import { Button } from '@/app/_components/button';
import { IconButton } from '@/app/_components/icon-button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
} from '@heroicons/react/24/solid';
import { useStep } from '@/app/_hooks/step';
import { Alert } from '@/app/_components/alert';
import { Heading } from '@/app/_components/heading';
import { Textarea } from '@/app/_components/form/textarea';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/app/_components/accordion';
import { useRecoilValue } from 'recoil';

export const SyntaxFixer: FC = () => {
  const invalidCount = useInvalidCount();
  const { count, isDisabledBack, isDisabledNext, back, next } =
    useStep({
      initialCount: 1,
      maxCount: invalidCount,
    });
  const resetResult = useResetResult();
  const isCheckResult = useIsCheckResult();

  return (
    <div className="flex flex-col items-center justify-center gap-8 rounded-md bg-white p-10">
      <div className="flex w-full justify-between gap-4">
        <Button onClick={resetResult}>テキスト入力に戻る</Button>
        <Button onClick={isCheckResult}>
          修正した内容を確認する
        </Button>
      </div>
      <div className="flex w-full items-center justify-evenly">
        <IconButton
          label="戻る"
          onClick={back}
          disabled={isDisabledBack}
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </IconButton>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-300">
          <p className="font-bold leading-none">
            {count}/{invalidCount}
          </p>
        </div>
        <IconButton
          label="次へ"
          onClick={next}
          disabled={isDisabledNext}
        >
          <ChevronRightIcon className="h-8 w-8" />
        </IconButton>
      </div>
      <FixText key={count} count={count} />
    </div>
  );
};

const FixText: FC<{ count: number }> = ({ count }) => {
  const id = useId();
  const texts = useRecoilValue(resultTextState);
  const { resultText, resultMessage, resultIdx } =
    useInvalidResult(count);
  const { fixText, handleFixTextChange } = useSetFixTextsField(
    resultIdx,
    resultText,
  );

  return (
    <div>
      <Alert status="error" message={resultMessage} />
      <div className="mt-8 grid gap-4">
        <section
          aria-labelledby={`fixer_${id}`}
          className="grid gap-2 "
        >
          <Heading id={`fixer_${id}`} type="h4">
            テキストを修正
          </Heading>
          <Textarea
            value={fixText}
            onChange={handleFixTextChange}
            autoResize
          />
        </section>
        <section aria-labelledby={`all_${id}`} className="w-full">
          <Accordion>
            <AccordionItem>
              <Heading type="h4">
                <AccordionButton>
                  <p id={`all_${id}`} className="text-lg">
                    原文を確認する
                  </p>
                </AccordionButton>
              </Heading>
              <AccordionPanel>
                <div className="relative p-3">
                  <div className="absolute right-0">
                    <IconButton
                      label="テキストをコピーする"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          texts.join('\n'),
                        )
                      }
                    >
                      <ClipboardIcon className="h-6 w-6" />
                    </IconButton>
                  </div>
                  <div>
                    <p className="whitespace-pre-wrap text-wrap break-all">
                      {texts.map((text, idx) => {
                        const separator = idx === 0 ? '' : '\n';
                        if (idx !== resultIdx) {
                          return (
                            <Fragment key={`${idx}_${text}`}>
                              {text + separator}
                            </Fragment>
                          );
                        }
                        return (
                          <span
                            key={`${idx}_${text}`}
                            className={'bg-infoLight'}
                          >
                            {text + separator}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
