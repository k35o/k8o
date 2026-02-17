import type { Annotation, LintMessage } from '../_state/types';

type ApiLintMessage = Omit<LintMessage, 'range'> & {
  range: number[];
};

const createId = (index: number) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `annotation-${Date.now().toString()}-${Math.random()
    .toString(36)
    .slice(2)}-${index.toString()}`;
};

export const buildAnnotations = (msgs: ApiLintMessage[]): Annotation[] => {
  return msgs.map((msg, index) => ({
    id: createId(index),
    original: {
      ...msg,
      range: [msg.range[0] ?? 0, msg.range[1] ?? 0] as [number, number],
    },
  }));
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('buildAnnotations', () => {
    it('APIレスポンスのmsgsからAnnotation配列を生成する', () => {
      const msgs: ApiLintMessage[] = [
        {
          type: 'lint',
          ruleId: 'rule-1',
          message: 'エラー1',
          index: 0,
          line: 1,
          column: 0,
          range: [0, 5],
          loc: {
            start: { line: 1, column: 0 },
            end: { line: 1, column: 5 },
          },
          severity: 1,
        },
        {
          type: 'lint',
          ruleId: 'rule-2',
          message: 'エラー2',
          index: 10,
          line: 1,
          column: 10,
          range: [10, 15],
          loc: {
            start: { line: 1, column: 10 },
            end: { line: 1, column: 15 },
          },
          severity: 2,
        },
      ];

      const result = buildAnnotations(msgs);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBeTruthy();
      expect(result[1]?.id).toBeTruthy();
      expect(result[0]?.id).not.toBe(result[1]?.id);
      expect(result[0]?.original).toEqual({ ...msgs[0], range: [0, 5] });
      expect(result[1]?.original).toEqual({ ...msgs[1], range: [10, 15] });
    });

    it('空のmsgsから空の配列を返す', () => {
      expect(buildAnnotations([])).toEqual([]);
    });
  });
}
