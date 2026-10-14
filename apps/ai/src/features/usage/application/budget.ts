export const MONTHLY_BUDGET_MICRO_USD = 100_000_000;

export const monthStartIso = (now: number): string => {
  const date = new Date(now);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  ).toISOString();
};
