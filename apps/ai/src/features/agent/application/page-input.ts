import * as z from 'zod/mini';

export const pageInputOf = (
  description: string,
): z.ZodMiniOptional<z.ZodMiniNumberFormat> =>
  z.optional(z.int().check(z.positive(), z.describe(description)));
