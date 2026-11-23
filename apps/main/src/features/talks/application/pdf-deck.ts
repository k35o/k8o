import { PDF_PAGE_WIDTHS, pdfPageImage } from '@repo/talk-deck/files';

// ページの画像の src と srcSet。page は 1 始まり
export const pdfPageSources = (
  slug: string,
  page: number,
): { src: string; srcSet: string } => {
  const [narrow, wide] = PDF_PAGE_WIDTHS;
  const url = (width: (typeof PDF_PAGE_WIDTHS)[number]): string =>
    `/talks/${slug}/${pdfPageImage(page, width)}`;
  return {
    src: url(wide),
    srcSet: `${url(narrow)} ${narrow.toString()}w, ${url(wide)} ${wide.toString()}w`,
  };
};
