export type GenerationMeta = {
  title: string;
  description: string;
  usedComponents: string[];
  changes: string[];
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

export const toMeta = (value: unknown): GenerationMeta | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  return {
    title: typeof record['title'] === 'string' ? record['title'] : '',
    description:
      typeof record['description'] === 'string' ? record['description'] : '',
    usedComponents: toStringArray(record['usedComponents']),
    changes: toStringArray(record['changes']),
  };
};
