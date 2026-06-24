import 'server-only';
import { getPublicShare, type PublicShare } from '../application/share';

export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

export type { PublicShare };
