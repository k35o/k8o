const BLOG_ARTICLE = '/blog/:slug';
const PLAYGROUND = '/playgrounds/:id';
const TAG = '/tags/:id';

// 記事のページと、その下の markdown・OG のパスを、公開済みの記事の一覧1つから作る。
// 下書きはどこにも挙がらないので、どれも書かれずに 404 になる
export const blogPathnames = (
  patterns: readonly string[],
  slugs: readonly string[],
): string[] =>
  patterns
    .filter(
      (pattern) =>
        pattern === BLOG_ARTICLE || pattern.startsWith(`${BLOG_ARTICLE}/`),
    )
    .flatMap((pattern) => slugs.map((slug) => pattern.replace(':slug', slug)));

// Playground のページと、その下の OG のパスを、デモの id の一覧から作る
export const playgroundPathnames = (
  patterns: readonly string[],
  ids: readonly string[],
): string[] =>
  patterns
    .filter(
      (pattern) =>
        pattern === PLAYGROUND || pattern.startsWith(`${PLAYGROUND}/`),
    )
    .flatMap((pattern) => ids.map((id) => pattern.replace(':id', id)));

// タグのページのパスを、DB の全タグの id から作る。中身が 0 件のタグも書く
export const tagPathnames = (
  patterns: readonly string[],
  ids: readonly number[],
): string[] =>
  patterns
    .filter((pattern) => pattern === TAG || pattern.startsWith(`${TAG}/`))
    .flatMap((pattern) =>
      ids.map((id) => pattern.replace(':id', id.toString())),
    );
