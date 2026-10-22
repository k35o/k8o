// stale-if-error は、DB や GitHub が落ちているあいだも CDN に古い値を返させるため
export const publicCacheControl = ({
  maxAge,
  sMaxAge,
}: {
  maxAge: number;
  sMaxAge: number;
}): string =>
  `public, max-age=${String(maxAge)}, s-maxage=${String(sMaxAge)}, stale-while-revalidate=86400, stale-if-error=86400`;
