// k8ordo の router は末尾のスラッシュの有無を同じページとして扱い、文書を読み込まずに行き来する
const withoutTrailingSlash = (pathname: string): string =>
  pathname.replace(/\/+$/u, '');

export const findOtherLoadedPathname = (
  documentUrl: string | undefined,
  currentPathname: string,
): string | null => {
  if (documentUrl === undefined) return null;

  const loadedPathname = new URL(documentUrl).pathname;
  return withoutTrailingSlash(loadedPathname) ===
    withoutTrailingSlash(currentPathname)
    ? null
    : loadedPathname;
};
