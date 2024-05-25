import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt =
  'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(70deg, #cbd5e1, #5eead4)',
          width: '100%',
          height: '100%',
          padding: '32px',
        }}
      >
        <div
          style={{
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            padding: '64px',
            borderRadius: '6px',
          }}
        >
          <p
            style={{
              color: 'black',
              fontSize: '60px',
              fontWeight: 'bold',
            }}
          >
            Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ
          </p>
          <p
            style={{
              fontSize: '128px',
              alignSelf: 'flex-end',
            }}
          >
            😃
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
