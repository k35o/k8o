'use client';

import { Textarea } from '@/app/_components/form/textarea';
import {
  ResultMessage,
  resultMessagesState,
  resultTextState,
  useTextField,
} from '../../_state/text';
import { Button } from '@/app/_components/button';
import { useState } from 'react';
import { checkJapaneseSyntax } from '../../_utils/japaneseSyntax';
import { useSetRecoilState } from 'recoil';

export const EditField = () => {
  const { text, handleTextChange } = useTextField();
  const [isMutating, setIsMutating] = useState(false);
  const setResultText = useSetRecoilState(resultTextState);
  const setResultMessages = useSetRecoilState(resultMessagesState);

  const handleCheck = async () => {
    setIsMutating(true);
    checkJapaneseSyntax({ text })
      .then((res) => {
        setResultText(res.text.split('\n'));
        setResultMessages(
          res.msgs.reduce((acc: ResultMessage, cur) => {
            const line = cur.line;
            return {
              ...acc,
              [line]: [...(acc[line] ?? []), cur.message],
            };
          }, []),
        );
      })
      .finally(() => {
        setIsMutating(false);
      });
  };

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={text}
        onChange={handleTextChange}
        placeholder="ここに文字列を入力してください"
        rows={10}
      />
      <Button onClick={handleCheck} fullWidth disabled={isMutating}>
        チェック
      </Button>
    </div>
  );
};
