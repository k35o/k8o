import { join } from 'node:path';

import { CONTENT_DIR } from '@/shared/site/content-dir';

export const slidePath = (slug: string) =>
  join(CONTENT_DIR, `slides/${slug}/content.mdx`);
