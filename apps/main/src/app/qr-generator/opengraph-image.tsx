import { loadDefaultJapaneseParser } from 'budoux';
import { ImageResponse } from 'next/og';
import { getIconDataUrl } from '@/app/_utils/get-icon-data-url';
import { getMPlus2Font } from '@/app/_utils/get-m-plus-2-font';

export const alt = 'QRKit';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const title = 'QRKit';
  const words = loadDefaultJapaneseParser().parse(title);
  const iconDataUrl = await getIconDataUrl();
  const fontText = `${title}k8oK8O`;
  const font450 = await getMPlus2Font({ text: fontText });

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
        fontFamily: '"M PLUS 2"',
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
            fontWeight: 450,
          }}
        >
          {words.map((word) => (
            <span key={word} style={{ display: 'block' }}>
              {word}
            </span>
          ))}
        </div>
        {/** biome-ignore lint/performance/noImgElement: ogのため */}
        <img
          alt="アイコン"
          height={128}
          src={iconDataUrl}
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
      ...size,
      fonts: [
        {
          name: 'M PLUS 2',
          data: font450,
          style: 'normal',
          weight: 450,
        },
      ],
    },
  );
}
