import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

if (import.meta.vitest) {
  describe('cn', () => {
    it('truthyなclass名を結合する', () => {
      expect(cn('px-2', false, undefined, 'py-4')).toBe('px-2 py-4');
    });

    it('競合するTailwind classは後勝ちでマージする', () => {
      expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
    });
  });
}
