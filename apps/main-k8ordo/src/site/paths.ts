const BLOG_ARTICLE = '/blog/:slug';

export type BlogArticle = { slug: string; mdx: string };

// PlaygroundEmbed と Playground はまだ描けないので、それを含む記事はページを書かない
export const writesPage = (article: BlogArticle): boolean =>
  !article.mdx.includes('<Playground');

// 記事のページと、その下の markdown・OG のパスを、公開済みの記事の一覧1つから作る。
// 下書きはどこにも挙がらないので、どれも書かれずに 404 になる
export const blogPathnames = (
  patterns: readonly string[],
  articles: readonly BlogArticle[],
): string[] =>
  patterns
    .filter(
      (pattern) =>
        pattern === BLOG_ARTICLE || pattern.startsWith(`${BLOG_ARTICLE}/`),
    )
    .flatMap((pattern) =>
      (pattern === BLOG_ARTICLE ? articles.filter(writesPage) : articles).map(
        (article) => pattern.replace(':slug', article.slug),
      ),
    );
