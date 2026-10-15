export const parseProjectId = (raw: string | null): number | null => {
  const id = raw === null ? Number.NaN : Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};
