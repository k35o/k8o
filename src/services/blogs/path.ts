import { join } from 'path';
import { cwd } from 'process';

export const blogPath = (slug: string) =>
  join(cwd(), `src/app/blog/(articles)/${slug}/page.mdx`);
