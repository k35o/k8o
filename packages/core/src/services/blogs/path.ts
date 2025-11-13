import { join } from 'node:path';
import { cwd } from 'node:process';

export const blogPath = (slug: string) =>
  join(cwd(), `src/app/blog/(articles)/${slug}/page.mdx`);
