const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY = 1;
const ONE_MILLISECOND = 1;

export function getJstDateBase(date: Date): Date {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  return new Date(
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()),
  );
}

export function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

export function getJstUtcStart(dateString: string): string {
  const [year, month, day] = parseDateString(dateString);
  const utc = new Date(Date.UTC(year, month - 1, day) - JST_OFFSET_MS);
  return utc.toISOString();
}

// JST日付の23:59:59.999を表現するため、翌日の00:00:00から1ミリ秒引く
export function getJstUtcEnd(dateString: string): string {
  const [year, month, day] = parseDateString(dateString);
  const utc = new Date(
    Date.UTC(year, month - 1, day + ONE_DAY) - JST_OFFSET_MS - ONE_MILLISECOND,
  );
  return utc.toISOString();
}

function parseDateString(dateString: string): [number, number, number] {
  const [year, month, day] = dateString.split('-');

  if (!(year && month && day)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  return [Number(year), Number(month), Number(day)];
}
