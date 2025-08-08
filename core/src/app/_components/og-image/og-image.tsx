import { loadDefaultJapaneseParser } from 'budoux';
import { ImageResponse } from 'next/og';

type OgImageProps = {
  title: string;
};

export function OgImage({ title }: OgImageProps) {
  const words = loadDefaultJapaneseParser().parse(title);

  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        backgroundColor: '#5eead4',
        backgroundImage: 'linear-gradient(62deg, #5eead4 0%, #67e8f9 100%)',
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
              key={`${word}-${index.toString()}`}
              style={{ display: 'block' }}
            >
              {word}
            </span>
          ))}
        </div>
        {/** biome-ignore lint/performance/noImgElement: ogなので */}
        <img
          alt="アイコン"
          height={128}
          src="https://k8o.me/icon.png"
          style={{
            borderRadius: 9999,
            objectFit: 'cover',
            margin: 64,
            marginTop: 0,
            alignSelf: 'flex-end',
          }}
          width={128}
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
