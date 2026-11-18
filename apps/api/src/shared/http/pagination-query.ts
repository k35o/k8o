import * as z from 'zod/mini';

export const pageQuery = z.coerce.number().check(z.int(), z.minimum(1));

export const pageSizeQuery = (max: number): typeof pageQuery =>
  z.coerce.number().check(z.int(), z.minimum(1), z.maximum(max));
