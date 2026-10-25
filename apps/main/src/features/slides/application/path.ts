import { join } from 'node:path';
import { cwd } from 'node:process';

export const slidePath = (slug: string) =>
  join(cwd(), `src/content/slides/${slug}/content.mdx`);
