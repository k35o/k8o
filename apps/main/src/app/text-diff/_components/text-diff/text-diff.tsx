'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { diffChars } from 'diff';
import { useDeferredValue, useMemo, useState } from 'react';
import { DiffOutput } from './diff-output';

type ResultPosition = 'top' | 'bottom';

export const TextDiff = () => {
  const [beforeText, setBeforeText] = useState('');
  const [afterText, setAfterText] = useState('');
  const [resultPosition, setResultPosition] =
    useState<ResultPosition>('bottom');

  // リアルタイム計算のパフォーマンス最適化
  const deferredBefore = useDeferredValue(beforeText);
  const deferredAfter = useDeferredValue(afterText);

  const diff = useMemo(() => {
    if (deferredBefore === '' && deferredAfter === '') {
      return [];
    }
    return diffChars(deferredBefore, deferredAfter);
  }, [deferredBefore, deferredAfter]);

  // 入力エリア
  const inputArea = (
    <div className="grid gap-4 md:grid-cols-2">
      <FormControl
        label="変更前"
        renderInput={({ labelId: _, ...props }) => (
          <Textarea
            {...props}
            autoResize
            onChange={(e) => setBeforeText(e.target.value)}
            placeholder="変更前のテキストを入力"
            value={beforeText}
          />
        )}
      />
      <FormControl
        label="変更後"
        renderInput={({ labelId: _, ...props }) => (
          <Textarea
            {...props}
            autoResize
            onChange={(e) => setAfterText(e.target.value)}
            placeholder="変更後のテキストを入力"
            value={afterText}
          />
        )}
      />
    </div>
  );

  // 差分表示エリア
  const resultArea = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-bold text-fg-base">差分結果</p>
        <div className="flex gap-1">
          <Button
            onClick={() => setResultPosition('top')}
            size="sm"
            variant={resultPosition === 'top' ? 'contained' : 'outlined'}
          >
            上に表示
          </Button>
          <Button
            onClick={() => setResultPosition('bottom')}
            size="sm"
            variant={resultPosition === 'bottom' ? 'contained' : 'outlined'}
          >
            下に表示
          </Button>
        </div>
      </div>
      <div className="min-h-24 rounded-md border border-border-base bg-bg-base p-4">
        <DiffOutput diff={diff} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {resultPosition === 'top' ? (
        <>
          {resultArea}
          {inputArea}
        </>
      ) : (
        <>
          {inputArea}
          {resultArea}
        </>
      )}
    </div>
  );
};
