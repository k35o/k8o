import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'かどまるラボ';
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
            borderBottomLeftRadius: '63% 57%',
            borderBottomRightRadius: '37% 63%',
            borderTopLeftRadius: '63% 43%',
            borderTopRightRadius: '37%',
            color: '#0f766e',
            display: 'flex',
            fontSize: 64,
            fontWeight: 'bold',
            height: 384,
            justifyContent: 'center',
            width: 384,
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
