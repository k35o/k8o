const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const pad2 = (n: number): string => String(n).padStart(2, '0');

export const formatDate = (
  date: Date,
  formatStr = 'yyyy年M月d日(E)',
): string => {
  const replacements: Record<string, string> = {
    yyyy: String(date.getFullYear()),
    MM: pad2(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    dd: pad2(date.getDate()),
    d: String(date.getDate()),
    HH: pad2(date.getHours()),
    mm: pad2(date.getMinutes()),
    E: WEEKDAYS[date.getDay()] ?? '',
  };

  return formatStr.replaceAll(
    /yyyy|MM|dd|HH|mm|M|d|E/gu,
    (token) => replacements[token] ?? token,
  );
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

  it('ゼロ埋め・時刻付きのフォーマットに対応する', () => {
    vi.useFakeTimers();
    vi.setSystemTime('2022-03-05T09:08:00Z');

    expect(formatDate(new Date(), 'yyyy/MM/dd HH:mm')).toBe('2022/03/05 09:08');
    expect(formatDate(new Date(), 'M/d')).toBe('3/5');
    expect(formatDate(new Date(), 'yyyy')).toBe('2022');
  });
}
