import { join } from 'node:path';
import { cwd } from 'node:process';

export const slidePath = (slug: string) =>
  join(cwd(), `src/app/slides/(decks)/${slug}/content.mdx`);
