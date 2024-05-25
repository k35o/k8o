import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt =
  '色のコントラスト比は重要だけどどうやって求めるんだっけ？';
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
          alignItems: 'center',
          display: 'flex',
          backgroundImage: 'linear-gradient(70deg, #cbd5e1, #5eead4)',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            background: 'white',
            width: 1136,
            height: 566,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            borderRadius: 6,
          }}
        >
          <p
            style={{
              margin: 64,
              color: 'black',
              fontSize: 60,
              fontWeight: 'bold',
            }}
          >
            色のコントラスト比は重要だけどどうやって求めるんだっけ？
          </p>
          <p
            style={{
              margin: 64,
              marginTop: 0,
              fontSize: 128,
              alignSelf: 'flex-end',
            }}
          >
            ⚖️
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
