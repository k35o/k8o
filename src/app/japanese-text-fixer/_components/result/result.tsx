'use client';

import { FC, useId } from 'react';
import {
  useConvertIncomplete,
  useFixedText,
  useResetResult,
} from '../../_state/text';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { useClipboard } from '@/hooks/clipboard';
import { ClipboardPenLine } from 'lucide-react';

export const Result: FC = () => {
  const id = useId();
  const fixedText = useFixedText();
  const resetResult = useResetResult();
  const isCheckResult = useConvertIncomplete();
  const { writeClipboard } = useClipboard();

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
            onClick={() => void writeClipboard(fixedText)}
            endIcon={
              <ClipboardPenLine aria-label="" className="size-6" />
            }
          >
            テキストをコピーする
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
