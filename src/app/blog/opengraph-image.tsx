import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'blog';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 256,
          background: '#2dd4bf',
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
          📕
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
