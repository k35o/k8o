export const formatDate = (
  input: string | number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = new Date(input);
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
  input: string | number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = new Date(input);
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

    const result = formatDate(new Date().toISOString());

    expect(result).toBe(expected);
  });

  it('日付をフォーマットする', () => {
    const expected = '2022年1月1日';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatDate(new Date().toISOString(), {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    expect(result).toBe(expected);
  });

  it('時間をデフォルト設定でフォーマットする', () => {
    const expected = '09:00:00';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatTime(new Date().toISOString());

    expect(result).toBe(expected);
  });

  it('時間をフォーマットする', () => {
    const expected = '09:00';
    vi.useFakeTimers();
    vi.setSystemTime('2022-01-01T00:00:00Z');

    const result = formatTime(new Date().toISOString(), {
      hour: '2-digit',
      minute: '2-digit',
    });

    expect(result).toBe(expected);
  });
}
