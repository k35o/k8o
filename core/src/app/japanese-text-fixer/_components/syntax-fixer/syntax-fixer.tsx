'use client';

import {
  useConvertComplete,
  useInvalidCount,
  useInvalidResult,
  useResetResult,
  useResultText,
  useSetFixTextsField,
} from '../../_state/text';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@k8o/arte-odyssey/accordion';
import { Alert } from '@k8o/arte-odyssey/alert';
import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { Heading } from '@k8o/arte-odyssey/heading';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { ChevronIcon } from '@k8o/arte-odyssey/icons';
import { useStep } from '@k8o/hooks/step';
import { FC, Fragment, useId } from 'react';

export const SyntaxFixer: FC = () => {
  const invalidCount = useInvalidCount();
  const { count, isDisabledBack, isDisabledNext, back, next } =
    useStep({
      initialCount: 1,
      maxCount: invalidCount,
    });
  const resetResult = useResetResult();
  const isCheckResult = useConvertComplete();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full justify-between gap-4">
        <Button variant="outlined" onClick={resetResult}>
          戻る
        </Button>
        <Button
          variant={isDisabledNext ? 'contained' : 'outlined'}
          onClick={isCheckResult}
        >
          修正後のテキストを確認する
        </Button>
      </div>
      <div className="flex w-full items-center justify-evenly">
        <IconButton
          label="戻る"
          onClick={back}
          disabled={isDisabledBack}
        >
          <ChevronIcon direction="left" size="lg" />
        </IconButton>
        <div className="bg-bg-base flex size-14 items-center justify-center rounded-full">
          <p className="leading-none font-bold">
            {count}/{invalidCount}
          </p>
        </div>
        <IconButton
          label="次へ"
          onClick={next}
          disabled={isDisabledNext}
        >
          <ChevronIcon direction="right" size="lg" />
        </IconButton>
      </div>
      <FixText key={count} count={count} />
    </div>
  );
};

const FixText: FC<{ count: number }> = ({ count }) => {
  const id = useId();
  const texts = useResultText();
  const { resultText, resultMessage, resultIdx } =
    useInvalidResult(count);
  const { fixText, handleFixTextChange } = useSetFixTextsField(
    resultIdx,
    resultText,
  );

  return (
    <div className="w-full">
      <Alert status="error" message={resultMessage} />
      <div className="mt-8 grid gap-6">
        <section
          aria-labelledby={`fixer_${id}`}
          className="grid gap-3"
        >
          <Heading id={`fixer_${id}`} type="h4">
            テキストを修正
          </Heading>
          <FormControl
            label="修正後のテキスト"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <Textarea
                  {...props}
                  value={fixText}
                  onChange={(e) => {
                    handleFixTextChange(e.target.value);
                  }}
                  autoResize
                  isRequired
                />
              );
            }}
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
                <p className="text-wrap break-all whitespace-pre-wrap">
                  {texts.map((text, idx) => {
                    const separator =
                      idx === texts.length - 1 ? '' : '\n';
                    if (idx !== resultIdx) {
                      return (
                        <Fragment key={`${idx.toString()}_${text}`}>
                          {text + separator}
                        </Fragment>
                      );
                    }
                    return (
                      <span
                        key={`${idx.toString()}_${text}`}
                        className="bg-bg-info"
                      >
                        {text + separator}
                      </span>
                    );
                  })}
                </p>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
