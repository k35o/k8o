import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'かどまるラボ';
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
            alignItems: 'center',
            background: 'white',
            borderBottomLeftRadius: '63% 57%',
            borderBottomRightRadius: '37% 63%',
            borderTopLeftRadius: '63% 43%',
            borderTopRightRadius: '37%',
            color: '#0f766e',
            display: 'flex',
            fontSize: 64,
            fontWeight: 'bold',
            height: 512,
            justifyContent: 'center',
            width: 512,
          }}
        >
          かどまるラボ
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
