// PDF から作ったデッキの、ストアと public/talks/<slug>/ に置くファイルの名前
export const PDF_DECK_MANIFEST = 'deck.json';
export const PDF_PAGE_WIDTHS = [960, 1920] as const;

// page は 1 始まり
export const pdfPageImage = (
  page: number,
  width: (typeof PDF_PAGE_WIDTHS)[number],
): string =>
  `pages/${page.toString().padStart(3, '0')}.${width.toString()}w.avif`;
