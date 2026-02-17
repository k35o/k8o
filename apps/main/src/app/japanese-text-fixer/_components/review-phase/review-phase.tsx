'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { Heading } from '@k8o/arte-odyssey/heading';
import { useToast } from '@k8o/arte-odyssey/toast';
import { type FC, useCallback, useId, useMemo } from 'react';
import { useProofreadDispatch, useProofreadState } from '../../_state/provider';
import type { Annotation } from '../../_state/types';
import { buildAnnotations } from '../../_utils/build-annotations';
import { checkJapaneseSyntax } from '../../_utils/japanese-syntax';

type LineItem = {
  lineIndex: number;
  annotation: Annotation;
};

type GroupedItem = {
  start: number;
  end: number;
  items: LineItem[];
};

const getLineIndexFromText = (text: string, index: number) => {
  if (index <= 0) return 0;
  let line = 0;
  for (let i = 0; i < text.length && i < index; i += 1) {
    if (text[i] === '\n') {
      line += 1;
    }
  }
  return line;
};

const buildGroups = (
  annotations: Annotation[],
  getLineIndex: (index: number) => number,
): GroupedItem[] => {
  const lineMap = new Map<number, Annotation[]>();
  for (const annotation of annotations) {
    const lineIndex = getLineIndex(annotation.original.index);
    const current = lineMap.get(lineIndex) ?? [];
    current.push(annotation);
    lineMap.set(lineIndex, current);
  }

  const errorLines = Array.from(lineMap.keys()).sort((a, b) => a - b);
  const ranges = errorLines.map((lineIndex) => ({
    start: lineIndex - 1,
    end: lineIndex + 1,
    lineIndex,
  }));

  const merged: Array<{ start: number; end: number; lineIndices: number[] }> =
    [];

  for (const range of ranges) {
    const last = merged.at(-1);
    if (!last || range.start > last.end + 1) {
      merged.push({
        start: range.start,
        end: range.end,
        lineIndices: [range.lineIndex],
      });
      continue;
    }
    last.end = Math.max(last.end, range.end);
    last.lineIndices.push(range.lineIndex);
  }

  return merged.map((group) => {
    const items = group.lineIndices
      .flatMap((lineIndex) =>
        (lineMap.get(lineIndex) ?? []).map((annotation) => ({
          lineIndex,
          annotation,
        })),
      )
      .sort(
        (a, b) =>
          a.annotation.original.index - b.annotation.original.index ||
          a.annotation.original.column - b.annotation.original.column,
      );
    return {
      start: group.start,
      end: group.end,
      items,
    };
  });
};

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
  const { onOpen } = useToast();

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

  const handleRecheck = () => {
    if (reviewText === '') return;
    dispatch({ type: 'START_CHECK' });
    void checkJapaneseSyntax({ text: reviewText })
      .then((res) => {
        const newAnnotations = buildAnnotations(res.msgs);
        if (newAnnotations.length === 0) {
          dispatch({
            type: 'CHECK_NO_ERRORS',
            payload: { text: res.text },
          });
        } else {
          dispatch({
            type: 'CHECK_SUCCESS',
            payload: { text: res.text, annotations: newAnnotations },
          });
        }
      })
      .catch(() => {
        dispatch({ type: 'CHECK_FAILURE' });
        onOpen('error', '校正に失敗しました。時間をおいて再度お試しください。');
      });
  };

  return (
    <div className="flex flex-col gap-6">
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
                    <div className="mt-6">
                      <EditLines
                        lines={lines}
                        onChange={updateLine}
                        targetLines={targetLines}
                      />
                    </div>
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
    </div>
  );
};
