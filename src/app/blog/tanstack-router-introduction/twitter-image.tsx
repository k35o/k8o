import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt =
  'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ';
export const size = {
  width: 500,
  height: 500,
};

export const contentType = 'image/png';

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#cbd5e1',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        😃
      </div>
    ),
    {
      ...size,
    },
  );
}
