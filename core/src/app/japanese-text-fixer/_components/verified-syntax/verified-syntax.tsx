'use client';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@k8o/arte-odyssey/accordion';
import { Button } from '@k8o/arte-odyssey/button';
import { useClipboard } from '@k8o/arte-odyssey/hooks/clipboard';
import { AlertIcon, CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import type { FC } from 'react';
import { useResetResult, useText } from '../../_state/text';

export const VerifiedSyntax: FC = () => {
  const text = useText();
  const resetResult = useResetResult();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full items-start justify-between">
        <Button onClick={resetResult} variant="outlined">
          戻る
        </Button>
        <Button
          endIcon={<CopyIcon />}
          onClick={() =>
            void writeClipboard(text).then(() => {
              onOpen('success', 'クリップボードにコピーしました');
            })
          }
        >
          テキストをコピーする
        </Button>
      </div>
      <p className="flex gap-1 font-bold text-lg">
        <span className="text-fg-success">
          <AlertIcon size="lg" status="success" />
        </span>
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
