// 区画の入口のページでは page、その下のページ（記事・デッキ）では true
export const navCurrentOf = (
  pathname: string,
  path: string,
): 'page' | 'true' | undefined => {
  if (pathname === path) {
    return 'page';
  }
  return pathname.startsWith(`${path}/`) ? 'true' : undefined;
};
