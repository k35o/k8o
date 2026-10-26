const BLOG_ARTICLE = '/blog/:slug';

// 記事のページと、その下の markdown・OG のパスを、公開済みの slug の一覧1つから作る。
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
