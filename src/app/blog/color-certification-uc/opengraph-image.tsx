import { ImageResponse } from 'next/og';
import { Parser, jaModel } from 'budoux';
import { getBlog } from '#actions/blog';

const parser = new Parser(jaModel);

export const alt = '色彩検定UC級に合格しました！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const blog = await getBlog({
    slug: 'color-certification-uc',
  });

  const words = parser.parse(blog ? blog.title : alt);
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          backgroundColor: '#50e2d2',
          backgroundImage:
            'linear-gradient(62deg, #50e2d2 0%, #0ea5e9 100%)',
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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