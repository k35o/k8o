import { getSharedAsset } from '@/features/share/interface/queries';

// 公開バンドルの静的アセットを配信する（認証なし）。iframe は sandbox="allow-scripts" の
// 不透明オリジンで読むため、モジュールスクリプトを読めるよう CORS を許可する。
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ slug: string; path?: string[] }> },
): Promise<Response> => {
  const { slug, path } = await params;
  const segments = path ?? [];
  const asset = await getSharedAsset(slug, segments);
  if (asset === null) {
    return new Response('Not found', { status: 404 });
  }

  // index.html は再公開で差し替わるので revalidate、ハッシュ付きアセットは長期 immutable。
  const isEntry = segments.length === 0 || segments.at(-1) === 'index.html';
  const cacheControl = isEntry
    ? 'no-cache'
    : 'public, max-age=31536000, immutable';

  return new Response(new Uint8Array(asset.body), {
    headers: {
      'content-type': asset.contentType,
      'access-control-allow-origin': '*',
      'cache-control': cacheControl,
    },
  });
};
