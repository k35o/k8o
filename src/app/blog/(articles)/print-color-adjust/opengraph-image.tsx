import { getBlogContent } from '#api/blog';
import { loadDefaultJapaneseParser } from 'budoux';
import { ImageResponse } from 'next/og';

export const alt = 'print-color-adjustで印刷時の色調整を制御する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const blog = await getBlogContent('print-color-adjust');

  const words = loadDefaultJapaneseParser().parse(blog.title);
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
            {words.map((word) => (
              <span style={{ display: 'block' }} key={word}>
                {word}
              </span>
            ))}
          </div>
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
      ...size,
    },
  );
}
