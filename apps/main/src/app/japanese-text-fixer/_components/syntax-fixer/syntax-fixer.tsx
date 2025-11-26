'use client';

import { Accordion } from '@k8o/arte-odyssey/accordion';
import { Alert } from '@k8o/arte-odyssey/alert';
import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { Heading } from '@k8o/arte-odyssey/heading';
import { useStep } from '@k8o/arte-odyssey/hooks/step';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { ChevronIcon } from '@k8o/arte-odyssey/icons';
import { type FC, Fragment, useId } from 'react';
import {
  useConvertComplete,
  useInvalidCount,
  useInvalidResult,
  useResetResult,
  useResultText,
  useSetFixTextsField,
} from '../../_state/text';

export const SyntaxFixer: FC = () => {
  const invalidCount = useInvalidCount();
  const { count, isDisabledBack, isDisabledNext, back, next } = useStep({
    initialCount: 1,
    maxCount: invalidCount,
  });
  const resetResult = useResetResult();
  const isCheckResult = useConvertComplete();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full justify-between gap-4">
        <Button onClick={resetResult} variant="outlined">
          戻る
        </Button>
        <Button
          onClick={isCheckResult}
          variant={isDisabledNext ? 'contained' : 'outlined'}
        >
          修正後のテキストを確認する
        </Button>
      </div>
      <div className="flex w-full items-center justify-evenly">
        <IconButton disabled={isDisabledBack} label="戻る" onClick={back}>
          <ChevronIcon direction="left" size="lg" />
        </IconButton>
        <div className="flex size-14 items-center justify-center rounded-full bg-bg-base">
          <p className="font-bold leading-none">
            {count}/{invalidCount}
          </p>
        </div>
        <IconButton disabled={isDisabledNext} label="次へ" onClick={next}>
          <ChevronIcon direction="right" size="lg" />
        </IconButton>
      </div>
      <FixText count={count} key={count} />
    </div>
  );
};

const FixText: FC<{ count: number }> = ({ count }) => {
  const id = useId();
  const texts = useResultText();
  const { resultText, resultMessage, resultIdx } = useInvalidResult(count);
  const { fixText, handleFixTextChange } = useSetFixTextsField(
    resultIdx,
    resultText,
  );

  return (
    <div className="w-full">
      <Alert message={resultMessage} status="error" />
      <div className="mt-8 grid gap-6">
        <section aria-labelledby={`fixer_${id}`} className="grid gap-3">
          <Heading id={`fixer_${id}`} type="h4">
            テキストを修正
          </Heading>
          <FormControl
            label="修正後のテキスト"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <Textarea
                  {...props}
                  autoResize
                  isRequired
                  onChange={(e) => {
                    handleFixTextChange(e.target.value);
                  }}
                  value={fixText}
                />
              );
            }}
          />
        </section>
        <section aria-labelledby={`all_${id}`} className="w-full">
          <Accordion.Root>
            <Accordion.Item>
              <Heading type="h4">
                <Accordion.Button>
                  <p className="text-lg" id={`all_${id}`}>
                    原文を確認する
                  </p>
                </Accordion.Button>
              </Heading>
              <Accordion.Panel>
                <p className="whitespace-pre-wrap text-wrap break-all">
                  {texts.map((text, idx) => {
                    const separator = idx === texts.length - 1 ? '' : '\n';
                    if (idx !== resultIdx) {
                      return (
                        <Fragment key={`${idx.toString()}_${text}`}>
                          {text + separator}
                        </Fragment>
                      );
                    }
                    return (
                      <span
                        className="bg-bg-info"
                        key={`${idx.toString()}_${text}`}
                      >
                        {text + separator}
                      </span>
                    );
                  })}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        </section>
      </div>
    </div>
  );
};
