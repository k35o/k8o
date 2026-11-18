export const cn = (
  ...classNames: Array<string | false | null | undefined>
): string => classNames.filter(Boolean).join(' ');

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe('cn', () => {
    it('truthyなclass名だけを空白区切りで結合する', () => {
      expect(cn('root', false, undefined, null, 'active')).toBe('root active');
    });
  });
}
