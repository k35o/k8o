export const buildSearchString = (
  current: string,
  updates: Record<string, string | null>,
): string => {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  const str = params.toString();
  return str === '' ? '' : `?${str}`;
};

export const firstParam = (
  value: string | string[] | undefined,
): string | undefined => (typeof value === 'string' ? value : undefined);

export const parsePageParam = (value: string | null | undefined): number => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
};

export const getTotalPages = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));
