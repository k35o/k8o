'use client';

import { Alert } from '@k8o/arte-odyssey/alert';
import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import { useClipboard } from '@k8o/arte-odyssey/hooks/clipboard';
import { CopyIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import type { FC } from 'react';
import { useCheckJapaneseSyntax } from '../../_state/hooks';
import { useProofreadDispatch, useProofreadState } from '../../_state/provider';

export const CompletePhase: FC = () => {
  const { annotations, reviewText, inputText, isChecking } =
    useProofreadState();
  const dispatch = useProofreadDispatch();
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();
  const checkSyntax = useCheckJapaneseSyntax();

  const hadErrors = annotations.length > 0;
  const displayText = hadErrors ? reviewText : inputText;

  const handleCopy = () => {
    void writeClipboard(displayText)
      .then(() => {
        onOpen('success', 'クリップボードにコピーしました');
      })
      .catch(() => {
        onOpen('error', 'コピーに失敗しました');
      });
  };

  const handleRecheck = () => {
    if (displayText === '') return;
    checkSyntax(displayText);
  };

  return (
    <div className="flex flex-col gap-6">
      {hadErrors ? (
        <Alert message="校正が完了しました" status="success" />
      ) : (
        <Alert
          message="テキストに問題は見つかりませんでした"
          status="success"
        />
      )}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Heading type="h3">
            {hadErrors ? '修正後のテキスト' : '入力したテキスト'}
          </Heading>
          <Button endIcon={<CopyIcon />} onClick={handleCopy} size="sm">
            <span className="sr-only md:not-sr-only">コピー</span>
          </Button>
        </div>
        <Card>
          <div className="p-4">
            <p className="whitespace-pre-wrap text-wrap break-all">
              {displayText}
            </p>
          </div>
        </Card>
      </section>
      <div className="sticky bottom-4">
        <Card>
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:justify-between sm:gap-4">
            <Button
              disabled={isChecking || displayText === ''}
              onClick={handleRecheck}
              variant="outlined"
            >
              {isChecking ? '校正中...' : 'もう一度校正する'}
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: 'RESET' });
              }}
              variant="outlined"
            >
              新しいテキストを校正する
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
