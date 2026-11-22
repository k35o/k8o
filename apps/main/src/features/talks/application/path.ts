import { join } from 'node:path';
import { cwd } from 'node:process';

import { CONTENT_DIR } from '@/shared/site/content-dir';
import { PDF_DECK_MANIFEST } from '@/site/pdf-deck-files';

export const deckMdxPath = (slug: string) =>
  join(CONTENT_DIR, `talks/${slug}/content.mdx`);

// PDF から作ったデッキは、ビルドの前にストアから public/talks/<slug>/ へ取り込まれる
export const pdfDeckPath = (slug: string) =>
  join(cwd(), `public/talks/${slug}`, PDF_DECK_MANIFEST);
