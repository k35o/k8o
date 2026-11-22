import * as z from 'zod/mini';

// upload:talk-deck が素の Node でこのファイルを読むので、@/ の別名を使わず拡張子まで書く
import { PDF_PAGE_WIDTHS, pdfPageImage } from '../../../site/pdf-deck-files.ts';

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

const ratio = z.number().check(z.minimum(0), z.maximum(1));

const size = z.int().check(z.positive());

const pdfDeck = z.object({
  pages: z
    .array(
      z.object({
        // 1920w の画像の寸法
        width: size,
        height: size,
        text: z.string(),
        // 発表者ノート。無いページは空の文字列
        notes: z.string(),
        // 位置と大きさはページに対する割合。href は PDF が書いた値なので、http(s) だけを通す
        links: z.array(
          z.object({
            href: z.string().check(z.regex(/^https?:\/\//u)),
            left: ratio,
            top: ratio,
            width: ratio,
            height: ratio,
          }),
        ),
      }),
    )
    .check(z.minLength(1)),
});

export type PdfDeck = z.infer<typeof pdfDeck>;

export const parsePdfDeck = (value: unknown): PdfDeck =>
  z.parse(pdfDeck, value);

// ノートのファイルを、--- だけの行でページごとに分ける。n 番目の塊が n ページ目のノートになる
export const splitNotes = (text: string): string[] =>
  text.split(/^---[ \t]*$/mu).map((notes) => notes.trim());
