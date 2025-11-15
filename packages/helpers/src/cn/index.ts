import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('cn', () => {
    describe('正常な入力の場合', () => {
      it('単一のクラス名を返すべき', () => {
        expect(cn('foo')).toBe('foo');
      });

      it('複数のクラス名を結合できるべき', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
      });

      it('条件付きクラス名を処理できるべき', () => {
        expect(cn('foo', 'bar', false)).toBe('foo bar');
      });

      it('オブジェクト形式のクラス名を処理できるべき', () => {
        expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
      });

      it('配列形式のクラス名を処理できるべき', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
      });

      it('Tailwindクラスを正しくマージできるべき', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
      });

      it('競合するTailwindクラスで後のものを優先するべき', () => {
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      });
    });

    describe('異常な入力の場合', () => {
      it('空の入力で空文字列を返すべき', () => {
        expect(cn()).toBe('');
      });

      it('nullやundefinedを無視するべき', () => {
        expect(cn('foo', null, undefined, 'bar')).toBe('foo bar');
      });

      it('空文字列を無視するべき', () => {
        expect(cn('foo', '', 'bar')).toBe('foo bar');
      });
    });

    describe('エッジケースの場合', () => {
      it('複雑な組み合わせを正しく処理できるべき', () => {
        expect(
          cn(
            'base-class',
            { conditional: true, 'not-included': false },
            ['array-class'],
            'px-2',
            'px-4',
          ),
        ).toBe('base-class conditional array-class px-4');
      });

      it('ネストされた配列を処理できるべき', () => {
        expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
      });
    });
  });
}
