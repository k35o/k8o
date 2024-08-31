import { ImageResponse } from 'next/og';
import { Parser, jaModel } from 'budoux';

const parser = new Parser(jaModel);

export const runtime = 'edge';

export const alt =
  '色のコントラスト比は重要だけどどうやって求めるんだっけ？';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const words = parser.parse(
    '色のコントラスト比は重要だけどどうやって求めるんだっけ？',
  );
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          backgroundColor: '#50e2d2',
          backgroundImage:
            'linear-gradient(62deg, #50e2d2 0%, #8584ae 100%)',
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
              margin: 64,
              color: 'black',
              fontSize: 60,
              fontWeight: 'bold',
            }}
          >
            {words.map((word) => (
              <span style={{ display: 'block' }} key={word}>
                {word}
              </span>
            ))}
          </div>
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
