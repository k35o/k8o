'use client';

import { FC, useId } from 'react';
import { useRecoilValue } from 'recoil';
import {
  fixedTextState,
  useIsBackSyntaxFixer,
  useResetResult,
} from '../../_state/text';
import { Button } from '@/components/button';
import { Heading } from '@/components/heading';
import { ClipboardIcon } from '@heroicons/react/24/solid';

export const Result: FC = () => {
  const id = useId();
  const fixedText = useRecoilValue(fixedTextState);
  const resetResult = useResetResult();
  const isCheckResult = useIsBackSyntaxFixer();

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
            onClick={() => navigator.clipboard.writeText(fixedText)}
            endIcon={<ClipboardIcon title="" className="h-6 w-6" />}
          >
            テキストをコピーする
          </Button>
        </div>
        <div className="rounded-md border border-border px-3 py-2">
          <p className="whitespace-pre-wrap text-wrap break-all">
            {fixedText}
          </p>
        </div>
      </section>
    </div>
  );
};
