import { join } from 'node:path';
import { cwd } from 'node:process';

import { CONTENT_DIR } from '@/shared/site/content-dir';
import { PDF_DECK_MANIFEST, pdfPageImage } from '@/site/pdf-deck-files';
import type { PDF_PAGE_WIDTHS } from '@/site/pdf-deck-files';

export const deckMdxPath = (slug: string) =>
  join(CONTENT_DIR, `talks/${slug}/content.mdx`);

// PDF から作ったデッキは、ビルドの前にストアから public/talks/<slug>/ へ取り込まれる
const pdfDeckDir = (slug: string) => join(cwd(), `public/talks/${slug}`);

export const pdfDeckPath = (slug: string) =>
  join(pdfDeckDir(slug), PDF_DECK_MANIFEST);

// page は 1 始まり
export const pdfPageImagePath = (
  slug: string,
  page: number,
  width: (typeof PDF_PAGE_WIDTHS)[number],
) => join(pdfDeckDir(slug), pdfPageImage(page, width));
