import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]): string => clsx(inputs);

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe('cn', () => {
    it('truthyなclass名だけを空白区切りで結合する', () => {
      expect(cn('root', false, undefined, null, 'active')).toBe('root active');
    });
  });
}
