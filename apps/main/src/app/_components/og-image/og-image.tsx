import { loadDefaultJapaneseParser } from 'budoux';
import { ImageResponse } from 'next/og';
import { getIconDataUrl } from '@/app/_utils/get-icon-data-url';
import { getMPlus2Font } from '@/app/_utils/get-m-plus-2-font';

type OgImageProps = {
  title: string;
  category?: string;
};

export async function OgImage({ title, category }: OgImageProps) {
  const words = loadDefaultJapaneseParser().parse(title);
  const iconDataUrl = await getIconDataUrl();
  const fontText = `${title}${category ?? ''}${(category ?? '').toUpperCase()}k8oK8O`;
  const font450 = await getMPlus2Font({ text: fontText });

  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        backgroundImage: 'linear-gradient(135deg, #cffafe 0%, #dbeafe 100%)',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        fontFamily: '"M PLUS 2"',
      }}
    >
      {/* 装飾的なグラデーション円 */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #22d3ee, #5eead4)',
          filter: 'blur(100px)',
          top: -200,
          right: -100,
          display: 'flex',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #60a5fa, #2dd4bf)',
          filter: 'blur(100px)',
          bottom: -150,
          left: -100,
          display: 'flex',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          background: '#ffffff',
          width: 1100,
          height: 550,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 32,
          boxShadow: '0 25px 50px -12px #27272a',
          position: 'relative',
          overflow: 'hidden',
          opacity: 0.98,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            margin: 64,
            marginTop: 80,
            marginBottom: 40,
            color: '#0f172a',
            fontSize: 68,
            fontWeight: 450,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {words.map((word, index) => (
            <span
              key={`${word}-${index.toString()}`}
              style={{
                display: 'block',
                color: '#0f172a',
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: 64,
            marginTop: 0,
            paddingTop: 32,
            borderTop: '2px solid #e4e4e7',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/** biome-ignore lint/performance/noImgElement: ogなので */}
            <img
              alt="アイコン"
              height={96}
              src={iconDataUrl}
              style={{
                borderRadius: 9999,
                objectFit: 'cover',
                boxShadow: '0 10px 25px -5px #27272a',
              }}
              width={96}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {category && (
                <span
                  style={{
                    color: '#334155',
                    fontSize: 32,
                    fontWeight: 450,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {category}
                </span>
              )}
              <span
                style={{
                  color: '#18181b',
                  fontSize: 48,
                  fontWeight: 450,
                }}
              >
                k8o
              </span>
            </div>
          </div>
          <div
            style={{
              width: 120,
              height: 8,
              borderRadius: 4,
              background:
                'linear-gradient(90deg, #22d3ee, #5eead4, #60a5fa, #2dd4bf)',
              display: 'flex',
              alignSelf: 'flex-end',
            }}
          />
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'M PLUS 2',
          data: font450,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
