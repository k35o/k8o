const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const pad2 = (n: number): string => String(n).padStart(2, '0');

// 実行環境のローカルTZに依存すると、サーバー(UTC)描画とクライアント描画で日付/時刻が
// ずれ、date-only 値では表示日が1日ずれたり hydration mismatch を起こす。閲覧者の
// TZ に関わらず一定の表示にするため、既定で日本時間に固定して整形する。
const DEFAULT_TIME_ZONE = 'Asia/Tokyo';

export const formatDate = (
  date: Date,
  formatStr = 'yyyy年M月d日(E)',
  timeZone = DEFAULT_TIME_ZONE,
): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  const year = lookup('year');
  const month = lookup('month');
  const day = lookup('day');
  // 指定TZの暦日から曜日を得る（UTC で同じ暦日を作り getUTCDay で参照する）。
  const weekday =
    WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];

  const replacements: Record<string, string> = {
    yyyy: String(year),
    MM: pad2(month),
    M: String(month),
    dd: pad2(day),
    d: String(day),
    HH: pad2(lookup('hour')),
    mm: pad2(lookup('minute')),
    E: weekday ?? '',
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

  it('ゼロ埋め・時刻付きのフォーマットに対応する（既定は日本時間）', () => {
    vi.useFakeTimers();
    vi.setSystemTime('2022-03-05T09:08:00Z');

    // 09:08 UTC は JST では 18:08
    expect(formatDate(new Date(), 'yyyy/MM/dd HH:mm')).toBe('2022/03/05 18:08');
    expect(formatDate(new Date(), 'M/d')).toBe('3/5');
    expect(formatDate(new Date(), 'yyyy')).toBe('2022');
  });

  it('date-only 値が閲覧TZに関わらず日付をずらさない', () => {
    // UTC 深夜として解釈される date-only 文字列でも、JST 固定なら同じ暦日で表示される
    expect(formatDate(new Date('2025-03-17'), 'yyyy/MM/dd')).toBe('2025/03/17');
  });

  it('timeZone を明示指定できる', () => {
    const instant = new Date('2022-03-05T09:08:00Z');
    expect(formatDate(instant, 'yyyy/MM/dd HH:mm', 'UTC')).toBe(
      '2022/03/05 09:08',
    );
    expect(formatDate(instant, 'yyyy/MM/dd HH:mm', 'Asia/Tokyo')).toBe(
      '2022/03/05 18:08',
    );
  });
}
