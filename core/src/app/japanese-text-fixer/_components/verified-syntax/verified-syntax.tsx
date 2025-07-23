'use client';

import { useResetResult, useText } from '../../_state/text';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@k8o/arte-odyssey/accordion';
import { Button } from '@k8o/arte-odyssey/button';
import { AlertIcon, CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { useClipboard } from '@k8o/hooks/clipboard';
import { FC } from 'react';

export const VerifiedSyntax: FC = () => {
  const text = useText();
  const resetResult = useResetResult();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex w-full items-start justify-between">
        <Button variant="outlined" onClick={resetResult}>
          戻る
        </Button>
        <Button
          onClick={() =>
            void writeClipboard(text).then(() => {
              onOpen('success', 'クリップボードにコピーしました');
            })
          }
          endIcon={<CopyIcon />}
        >
          テキストをコピーする
        </Button>
      </div>
      <p className="flex gap-1 text-lg font-bold">
        <span className="text-fg-success">
          <AlertIcon status="success" size="lg" />
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
                <p className="text-wrap break-all whitespace-pre-wrap">
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
