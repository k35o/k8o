import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import {
  PDF_DECK_MANIFEST,
  PDF_DECK_SOURCE,
  PDF_PAGE_WIDTHS,
  pdfDeckBlobPrefix,
  pdfPageImage,
} from '@repo/talk-deck/files';
import { get, list } from '@vercel/blob';

// size が分からないストアのファイルは、毎回取り直す
type StoreFile = { pathname: string; size?: number };

export type PdfDeckStore = {
  list: (prefix: string) => Promise<StoreFile[]>;
  download: (pathname: string, to: string) => Promise<void>;
};

const listBlobs = async (prefix: string): Promise<StoreFile[]> => {
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

type Fetch = (url: string) => Promise<Response>;

// k8o.me に出ているデッキを、公開されているファイルから読む。トークンが要らず、読めるのは公開済みのデッキだけ。
// マニフェストは最後に挙げる。写す途中で止まっても、マニフェストの無いデッキとして次に取り直される
export const publicSiteStore = (
  origin: string,
  fetcher: Fetch = fetch,
): PdfDeckStore => {
  const read = async (pathname: string): Promise<Response | null> => {
    const url = `${origin}/${pathname}`;
    const response = await fetcher(url);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`${url} を読めない（${response.status.toString()}）`);
    }
    return response;
  };
  return {
    list: async (prefix) => {
      const manifest = `${prefix}${PDF_DECK_MANIFEST}`;
      const response = await read(manifest);
      if (response === null) {
        return [];
      }
      const { pages } = (await response.json()) as { pages: unknown[] };
      return [
        ...pages.flatMap((_, index) =>
          PDF_PAGE_WIDTHS.map((width) => ({
            pathname: `${prefix}${pdfPageImage(index + 1, width)}`,
          })),
        ),
        { pathname: manifest },
      ];
    },
    download: async (pathname, to) => {
      const response = await read(pathname);
      if (response === null) {
        throw new Error(`${origin}/${pathname} を読めない（404）`);
      }
      await writeFile(to, await response.bytes());
    },
  };
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

// 手元にマニフェストの無いデッキだけを、ストアから decksDir/<slug>/ へ写す。手元のデッキは置き換えず、
// 挙がっていないディレクトリも消さない。ストアに無いデッキは飛ばす（公開前のデッキは、デッキ無しとして出る）
export const fillMissingPdfDecks = async ({
  slugs,
  decksDir,
  store,
}: {
  slugs: readonly string[];
  decksDir: string;
  store: PdfDeckStore;
}): Promise<void> => {
  await Promise.all(
    slugs.map(async (slug) => {
      const deckDir = join(decksDir, slug);
      if ((await sizeOf(join(deckDir, PDF_DECK_MANIFEST))) !== undefined) {
        return;
      }
      const prefix = pdfDeckBlobPrefix(slug);
      for (const { pathname } of await store.list(prefix)) {
        const name = pathname.slice(prefix.length);
        if (name !== PDF_DECK_SOURCE) {
          const to = join(deckDir, name);
          await mkdir(dirname(to), { recursive: true });
          await store.download(pathname, to);
        }
      }
    }),
  );
};
