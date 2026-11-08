// base（`/blog/:slug` など）とその下のパターンの最後の :param を、値の一覧で置き換えたパスを作る。
// base の下でないパターンには作らない（framework が、どの paths にも挙がらないパターンを名指しして止める）
export const expandPathnames = (
  patterns: readonly string[],
  base: `/${string}/:${string}`,
  values: ReadonlyArray<string | number>,
): string[] => {
  const param = base.slice(base.lastIndexOf('/') + 1);
  return patterns
    .filter((pattern) => pattern === base || pattern.startsWith(`${base}/`))
    .flatMap((pattern) =>
      values.map((value) => pattern.replace(param, value.toString())),
    );
};
