import * as z from 'zod/mini';

const ratio = z.number().check(z.minimum(0), z.maximum(1));

const size = z.int().check(z.positive());

const textTag = z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);

export type PdfTextTag = z.infer<typeof textTag>;

const line = z.object({
  text: z.string(),
  left: ratio,
  top: ratio,
  width: ratio,
  height: ratio,
});

export type PdfLine = z.infer<typeof line>;

const block = z.union([
  z.object({ tag: z.literal('img'), alt: z.string() }),
  z.object({ tag: textTag, lines: z.array(line) }),
]);

export type PdfBlock = z.infer<typeof block>;

const pdfDeck = z.object({
  pages: z
    .array(
      z.object({
        // 1920w の画像の寸法
        width: size,
        height: size,
        blocks: z.array(block),
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
