import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'talks';
export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#2dd4bf',
          display: 'flex',
          fontSize: 192,
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            background: 'white',
            borderRadius: 9999,
            display: 'flex',
            height: 384,
            justifyContent: 'center',
            width: 384,
          }}
        >
          🎙️
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
