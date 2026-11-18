import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { get, list } from '@vercel/blob';

// 元の PDF。保管のためにストアにだけ置き、サイトには出さない
export const PDF_DECK_SOURCE = 'deck.pdf';

export const pdfDeckBlobPrefix = (slug: string): string => `talks/${slug}/`;

type StoreFile = { pathname: string; size: number };

export type PdfDeckStore = {
  list: (prefix: string) => Promise<StoreFile[]>;
  download: (pathname: string, to: string) => Promise<void>;
};

export const listBlobs = async (
  prefix: string,
): Promise<Array<StoreFile & { url: string }>> => {
  let result = await list({ prefix });
  const blobs = [...result.blobs];
  while (result.cursor !== undefined) {
    result = await list({ prefix, cursor: result.cursor });
    blobs.push(...result.blobs);
  }
  return blobs;
};

export const blobStore: PdfDeckStore = {
  list: listBlobs,
  download: async (pathname, to) => {
    const result = await get(pathname, { access: 'private' });
    if (result?.statusCode !== 200) {
      throw new Error(`ストアから ${pathname} を読めない`);
    }
    await writeFile(to, await new Response(result.stream).bytes());
  },
};

const sizeOf = async (path: string): Promise<number | undefined> => {
  try {
    return (await stat(path)).size;
  } catch {
    return undefined;
  }
};

// slug を持つトークの PDF のデッキをストアから decksDir/<slug>/ へ写し、挙がっていないデッキのディレクトリを消す。
// 元の PDF は写さない。ストアに無いデッキは投げる（デッキを出したのに中身が無いサイトを出さない）。大きさが同じファイルは取り直さない
export const syncPdfDecks = async ({
  slugs,
  decksDir,
  store,
}: {
  slugs: readonly string[];
  decksDir: string;
  store: PdfDeckStore;
}): Promise<void> => {
  await mkdir(decksDir, { recursive: true });
  const entries = await readdir(decksDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !slugs.includes(entry.name))
      .map((entry) =>
        rm(join(decksDir, entry.name), { recursive: true, force: true }),
      ),
  );

  await Promise.all(
    slugs.map(async (slug) => {
      const prefix = pdfDeckBlobPrefix(slug);
      const files = await store.list(prefix);
      if (files.length === 0) {
        throw new Error(
          `トーク "${slug}" のデッキは MDX が無く、ストアの ${prefix} にも中身が無い`,
        );
      }
      const deckDir = join(decksDir, slug);
      for (const { pathname, size } of files) {
        const name = pathname.slice(prefix.length);
        const to = join(deckDir, name);
        if (name !== PDF_DECK_SOURCE && (await sizeOf(to)) !== size) {
          await mkdir(dirname(to), { recursive: true });
          await store.download(pathname, to);
        }
      }
    }),
  );
};
