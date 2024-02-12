import Image from 'next/image';
import { ImageResponse } from 'next/og';
import icon from './../icon.png';

export const runtime = 'edge';

export const alt = 'What am I?';
export const size = {
  width: 500,
  height: 500,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
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
        <Image src={icon} alt="アイコン" />
        <p>What am I?</p>
      </div>
    ),
    {
      ...size,
    },
  );
}
