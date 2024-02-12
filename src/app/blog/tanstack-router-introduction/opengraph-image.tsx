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
          background: 'linear-gradient(70deg, blue, pink);',
          width: '100%',
          height: '100%',
          padding: '32px',
        }}
      >
        <div className="flex h-full w-full flex-col justify-evenly rounded-md bg-white p-16">
          <p className="text-6xl font-bold">
            Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ
          </p>
          <p className="self-end text-9xl">😃</p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
