export const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  return date.toLocaleDateString(
    'ja',
    options
      ? options
      : {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'narrow',
        },
  );
};

export const formatTime = (
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  return date.toLocaleTimeString(
    'ja',
    options
      ? options
      : {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
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

    const result = formatDate(new Date(), {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    expect(result).toBe(expected);
  });

  it('時間をデフォルト設定でフォーマットする', () => {
    const expected = '00:00:00';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatTime(new Date());

    expect(result).toBe(expected);
  });

  it('時間をフォーマットする', () => {
    const expected = '00:00';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatTime(new Date(), {
      hour: '2-digit',
      minute: '2-digit',
    });

    expect(result).toBe(expected);
  });
}
