import 'server-only';
import { getPublicShare } from '../application/share';
import type { PublicShare } from '../application/share';

export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

export type { PublicShare };
