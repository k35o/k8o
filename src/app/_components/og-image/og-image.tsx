import { loadDefaultJapaneseParser } from 'budoux';
import { ImageResponse } from 'next/og';

type OgImageProps = {
  title: string;
};

export function OgImage({ title }: OgImageProps) {
  const words = loadDefaultJapaneseParser().parse(title);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          backgroundColor: '#5eead4',
          backgroundImage:
            'linear-gradient(62deg, #5eead4 0%, #67e8f9 100%)',
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
            borderRadius: 36,
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
            {words.map((word, index) => (
              <span
                style={{ display: 'block' }}
                key={`${word}-${index.toString()}`}
              >
                {word}
              </span>
            ))}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- ogではIamgeを使えない */}
          <img
            src="https://k8o.me/icon.png"
            width={128}
            height={128}
            alt="アイコン"
            style={{
              borderRadius: 9999,
              objectFit: 'cover',
              margin: 64,
              marginTop: 0,
              alignSelf: 'flex-end',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
