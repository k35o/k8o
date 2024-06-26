import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'What am I?';
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
          fontSize: 64,
          background: '#cbd5e1',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://k8o.me/icon.png"
          width={256}
          height={256}
          alt="アイコン"
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
