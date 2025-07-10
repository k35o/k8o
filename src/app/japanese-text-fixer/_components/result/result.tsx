'use client';

import {
  useConvertIncomplete,
  useFixedText,
  useResetResult,
} from '../../_state/text';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { CopyIcon } from '@/components/icons';
import { useToast } from '@/components/toast';
import { useClipboard } from '@k8o/hooks/clipboard';
import { FC, useId } from 'react';

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
        <Button variant="outlined" onClick={isCheckResult}>
          修正画面に戻る
        </Button>
        <Button variant="outlined" onClick={resetResult}>
          最初に戻る
        </Button>
      </div>
      <section aria-labelledby={id} className="grid w-full gap-3">
        <div className="flex items-center justify-between">
          <Heading id={id} type="h4">
            修正後のテキスト
          </Heading>
          <Button
            onClick={() => {
              void writeClipboard(fixedText).then(() => {
                onOpen('success', 'クリップボードにコピーしました');
              });
            }}
            endIcon={<CopyIcon />}
          >
            <span className="sr-only md:not-sr-only">
              テキストをコピーする
            </span>
          </Button>
        </div>
        <div className="border-border-base bg-bg-base rounded-md border px-3 py-2">
          <p className="text-wrap break-all whitespace-pre-wrap">
            {fixedText}
          </p>
        </div>
      </section>
    </div>
  );
};
