import { z } from 'zod';

export const pageInput = z.number().int().min(1).default(1);

export const pageSizeInput = (
  max: number,
  defaultSize: number,
): z.ZodDefault<z.ZodNumber> =>
  z.number().int().min(1).max(max).default(defaultSize);
