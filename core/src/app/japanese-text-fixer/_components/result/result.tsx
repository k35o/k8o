'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Heading } from '@k8o/arte-odyssey/heading';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { useClipboard } from '@k8o/hooks/clipboard';
import { type FC, useId } from 'react';
import {
  useConvertIncomplete,
  useFixedText,
  useResetResult,
} from '../../_state/text';

export const Result: FC = () => {
  const id = useId();
  const fixedText = useFixedText();
  const resetResult = useResetResult();
  const isCheckResult = useConvertIncomplete();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full justify-between gap-4">
        <Button onClick={isCheckResult} variant="outlined">
          修正画面に戻る
        </Button>
        <Button onClick={resetResult} variant="outlined">
          最初に戻る
        </Button>
      </div>
      <section aria-labelledby={id} className="grid w-full gap-3">
        <div className="flex items-center justify-between">
          <Heading id={id} type="h4">
            修正後のテキスト
          </Heading>
          <Button
            endIcon={<CopyIcon />}
            onClick={() => {
              void writeClipboard(fixedText).then(() => {
                onOpen('success', 'クリップボードにコピーしました');
              });
            }}
          >
            <span className="sr-only md:not-sr-only">テキストをコピーする</span>
          </Button>
        </div>
        <div className="rounded-md border border-border-base bg-bg-base px-3 py-2">
          <p className="whitespace-pre-wrap text-wrap break-all">{fixedText}</p>
        </div>
      </section>
    </div>
  );
};
