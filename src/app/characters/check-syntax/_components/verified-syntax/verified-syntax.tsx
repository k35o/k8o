'use client';

import {
  CheckCircleIcon,
  ClipboardIcon,
} from '@heroicons/react/24/solid';
import { FC } from 'react';
import { useResetResult, useText } from '../../_state/text';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/components/accordion';
import { Button } from '@/components/button';
import { useClipboard } from '@/hooks/clipboard';

export const VerifiedSyntax: FC = () => {
  const text = useText();
  const resetResult = useResetResult();
  const { writeClipboard } = useClipboard();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full items-start justify-between">
        <Button variant="outlined" onClick={resetResult}>
          戻る
        </Button>
        <Button
          onClick={() => writeClipboard(text)}
          endIcon={<ClipboardIcon title="" className="size-6" />}
        >
          テキストをコピーする
        </Button>
      </div>
      <CheckCircleIcon title="" className="size-36 text-success" />
      <p className="text-lg font-bold">
        テキストに問題は見つかりませんでした
      </p>
      <div className="w-full">
        <Accordion>
          <AccordionItem>
            <h4>
              <AccordionButton>
                <p className="text-lg">入力したテキストを確認する</p>
              </AccordionButton>
            </h4>
            <AccordionPanel>
              <div className="p-3">
                <p className="whitespace-pre-wrap text-wrap break-all">
                  {text}
                </p>
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
