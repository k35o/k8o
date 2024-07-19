'use client';

import {
  CheckCircleIcon,
  ClipboardIcon,
} from '@heroicons/react/24/solid';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { textState, useResetResult } from '../../_state/text';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/app/_components/accordion';
import { Button } from '@/app/_components/button';

export const VerifiedSyntax: FC = () => {
  const text = useRecoilValue(textState);
  const resetResult = useResetResult();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full items-start justify-between">
        <Button variant="outlined" onClick={resetResult}>
          戻る
        </Button>
        <Button
          onClick={() => navigator.clipboard.writeText(text)}
          endIcon={<ClipboardIcon title="" className="h-6 w-6" />}
        >
          テキストをコピーする
        </Button>
      </div>
      <CheckCircleIcon title="" className="h-36 w-36 text-success" />
      <p className="text-lg font-bold">
        テキストに問題は見つかりませんでした。
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
