import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '日本語校正くん';
export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#cbd5e1',
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
          🧐
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}