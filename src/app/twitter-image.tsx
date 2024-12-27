import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'k8o';
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
          background: '#cbd5e1',
          display: 'flex',
          fontSize: 64,
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://k8o.me/icon.png"
            width={384}
            height={384}
            alt="アイコン"
            style={{
              borderRadius: 9999,
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
