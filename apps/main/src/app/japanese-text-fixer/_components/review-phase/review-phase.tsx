'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { Heading } from '@k8o/arte-odyssey/heading';
import { type FC, useCallback, useId, useMemo } from 'react';
import { useCheckJapaneseSyntax } from '../../_state/hooks';
import { useProofreadDispatch, useProofreadState } from '../../_state/provider';
import type { LineItem } from '../../_utils/build-groups';
import { buildGroups, getLineIndexFromText } from '../../_utils/build-groups';

const ErrorList: FC<{ items: LineItem[] }> = ({ items }) => {
  const grouped = useMemo(() => {
    const map = new Map<number, LineItem[]>();
    for (const item of items) {
      const current = map.get(item.lineIndex) ?? [];
      current.push(item);
      map.set(item.lineIndex, current);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="flex flex-col gap-4 text-sm">
      {grouped.map(([lineIndex, lineItems]) => (
        <div
          className="flex flex-col gap-2"
          key={`line-${lineIndex.toString()}`}
        >
          <div>
            <span className="inline-block rounded-sm bg-bg-error px-4 py-1 text-center text-fg-error text-xs">
              {(lineIndex + 1).toString()}行目
            </span>
          </div>
          <ul className="flex list-inside list-disc flex-col gap-2 text-fg-base">
            {lineItems.map((item) => (
              <li key={item.annotation.id}>
                {item.annotation.original.message}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const EditLines: FC<{
  lines: string[];
  targetLines: number[];
  onChange: (lineIndex: number, value: string) => void;
}> = ({ lines, targetLines, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {targetLines
        .filter((idx) => idx >= 0 && idx < lines.length)
        .map((idx) => {
          const lineNumber = idx + 1;
          return (
            <FormControl
              key={`line-${lineNumber.toString()}`}
              label={`${lineNumber.toString()}行目`}
              renderInput={(props) => (
                <Textarea
                  {...props}
                  autoResize
                  onChange={(e) => {
                    onChange(idx, e.target.value);
                  }}
                  value={lines[idx] ?? ''}
                />
              )}
            />
          );
        })}
    </div>
  );
};

export const ReviewPhase: FC = () => {
  const { reviewText, isChecking, annotations } = useProofreadState();
  const dispatch = useProofreadDispatch();
  const headingId = useId();
  const checkSyntax = useCheckJapaneseSyntax();

  const lines = useMemo(() => reviewText.split('\n'), [reviewText]);

  const getLineIndex = useCallback(
    (index: number) => {
      return getLineIndexFromText(reviewText, index);
    },
    [reviewText],
  );

  const updateLine = useCallback(
    (lineIndex: number, value: string) => {
      if (lineIndex < 0 || lineIndex >= lines.length) return;
      const next = [...lines];
      next[lineIndex] = value;
      dispatch({ type: 'SET_REVIEW_TEXT', payload: next.join('\n') });
    },
    [dispatch, lines],
  );

  const groupedAnnotations = useMemo(
    () => buildGroups(annotations, getLineIndex),
    [annotations, getLineIndex],
  );

  const handleRecheck = useCallback(() => {
    if (reviewText === '') return;
    checkSyntax(reviewText);
  }, [checkSyntax, reviewText]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <Heading id={headingId} type="h3">
          エラー箇所を編集
        </Heading>
        <p className="text-fg-mute text-sm">
          行番号ごとにエラー内容を表示しています。前後1行を含めて編集できます。
        </p>
        <div className="flex flex-col gap-4">
          {groupedAnnotations.map((group) => {
            const targetLines = Array.from(
              { length: group.end - group.start + 1 },
              (_, idx) => group.start + idx,
            );
            return (
              <Card
                key={`line-${group.start.toString()}-${group.end.toString()}`}
              >
                <div className="flex flex-col gap-10 p-4">
                  <ErrorList items={group.items} />
                  <EditLines
                    lines={lines}
                    onChange={updateLine}
                    targetLines={targetLines}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      <div className="sticky bottom-4">
        <Card>
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:justify-between sm:gap-4">
            <Button
              disabled={isChecking || reviewText === ''}
              onClick={handleRecheck}
              variant="outlined"
            >
              {isChecking ? '校正中...' : 'もう一度校正する'}
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: 'COMPLETE_REVIEW' });
              }}
            >
              校正完了
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
