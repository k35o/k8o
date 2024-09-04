import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'base converter';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 256,
          background: '#cbd5e1',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'white',
            width: 512,
            height: 512,
            display: 'flex',
            borderRadius: 9999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🧬
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
