import type { Annotation } from '../_state/types';

export type LineItem = {
  lineIndex: number;
  annotation: Annotation;
};

export type GroupedItem = {
  start: number;
  end: number;
  items: LineItem[];
};

export const getLineIndexFromText = (text: string, index: number) => {
  if (index < 0) return 0;
  let line = 0;
  for (let i = 0; i < text.length && i < index; i += 1) {
    if (text[i] === '\n') {
      line += 1;
    }
  }
  return line;
};

export const buildGroups = (
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
    start: Math.max(0, lineIndex - 1),
    end: lineIndex + 1,
    lineIndex,
  }));

  const merged: Array<{ start: number; end: number; lineIndices: number[] }> =
    [];

  for (const range of ranges) {
    const last = merged.at(-1);
    // 前後1行を含む範囲同士は、1行ギャップまで同一グループとして扱う
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

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('buildGroups', () => {
    it('単一アノテーションを1グループにする', () => {
      const annotations: Annotation[] = [
        {
          id: 'a1',
          original: {
            type: 'lint',
            ruleId: 'test',
            message: 'テスト',
            index: 0,
            line: 1,
            column: 0,
            range: [0, 3],
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 3 },
            },
            severity: 1,
          },
        },
      ];
      const text = 'テスト';
      const getLineIndex = (index: number) => getLineIndexFromText(text, index);
      const groups = buildGroups(annotations, getLineIndex);
      expect(groups).toHaveLength(1);
      expect(groups[0]?.start).toBe(0);
      expect(groups[0]?.end).toBe(1);
      expect(groups[0]?.items).toHaveLength(1);
    });

    it('隣接する行は1グループにマージされる', () => {
      const annotations: Annotation[] = [
        {
          id: 'a1',
          original: {
            type: 'lint',
            ruleId: 'test-1',
            message: 'テスト1',
            index: 0,
            line: 1,
            column: 0,
            range: [0, 3],
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 3 },
            },
            severity: 1,
          },
        },
        {
          id: 'a2',
          original: {
            type: 'lint',
            ruleId: 'test-2',
            message: 'テスト2',
            index: 4,
            line: 2,
            column: 0,
            range: [4, 7],
            loc: {
              start: { line: 2, column: 0 },
              end: { line: 2, column: 3 },
            },
            severity: 1,
          },
        },
      ];
      const text = 'aaa\nbbb';
      const getLineIndex = (index: number) => getLineIndexFromText(text, index);
      const groups = buildGroups(annotations, getLineIndex);
      expect(groups).toHaveLength(1);
    });

    it('離れた行は別グループになる', () => {
      const annotations: Annotation[] = [
        {
          id: 'a1',
          original: {
            type: 'lint',
            ruleId: 'test-1',
            message: 'テスト1',
            index: 0,
            line: 1,
            column: 0,
            range: [0, 3],
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 3 },
            },
            severity: 1,
          },
        },
        {
          id: 'a2',
          original: {
            type: 'lint',
            ruleId: 'test-2',
            message: 'テスト2',
            index: 9,
            line: 4,
            column: 0,
            range: [9, 12],
            loc: {
              start: { line: 4, column: 0 },
              end: { line: 4, column: 3 },
            },
            severity: 1,
          },
        },
      ];
      const text = 'a\nb\nc\nd';
      const getLineIndex = (index: number) => getLineIndexFromText(text, index);
      const groups = buildGroups(annotations, getLineIndex);
      expect(groups).toHaveLength(2);
    });
  });
}
