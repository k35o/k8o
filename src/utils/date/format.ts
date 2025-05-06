import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDate = (
  date: Date,
  formatStr = 'yyyy年M月d日(E)',
): string => {
  return format(date, formatStr, { locale: ja });
};

if (import.meta.vitest) {
  it('日付をデフォルト設定でフォーマットする', () => {
    const expected = '2022年1月1日(土)';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatDate(new Date());

    expect(result).toBe(expected);
  });

  it('日付をフォーマットする', () => {
    const expected = '2022年1月1日';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatDate(new Date(), 'yyyy年M月d日');

    expect(result).toBe(expected);
  });
}
