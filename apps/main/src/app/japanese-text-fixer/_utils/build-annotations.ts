import type { Annotation, LintMessage } from '../_state/types';

type ApiLintMessage = Omit<LintMessage, 'range'> & {
  range: number[];
};

export const buildAnnotations = (msgs: ApiLintMessage[]): Annotation[] => {
  return msgs.map((msg, index) => ({
    id: `annotation-${index.toString()}`,
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
      expect(result[0]).toEqual({
        id: 'annotation-0',
        original: { ...msgs[0], range: [0, 5] },
      });
      expect(result[1]).toEqual({
        id: 'annotation-1',
        original: { ...msgs[1], range: [10, 15] },
      });
    });

    it('空のmsgsから空の配列を返す', () => {
      expect(buildAnnotations([])).toEqual([]);
    });
  });
}
