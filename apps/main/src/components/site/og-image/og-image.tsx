import { getIconDataUrl } from '@/shared/og/og-assets';
import { renderCoverOgPng } from '@/shared/og/render-cover-og-png';
import { renderOgPng } from '@/shared/og/render-og-png';

import { OgCodeImage } from './og-code-image';
import { mPlus2Font, OgFrame, ogTitleWords } from './og-frame';

type OgImageProps = {
  title: string;
  category?: string | undefined;
  code?:
    | {
        lang: string;
        code: string;
      }
    | undefined;
  // 表紙の画像。渡すと題を描かず、表紙をそのまま OG にする
  cover?: Uint8Array | undefined;
};

export async function OgImage({
  title,
  category,
  code,
  cover,
}: OgImageProps): Promise<Response> {
  if (cover) {
    return renderCoverOgPng(cover);
  }
  if (code) {
    return OgCodeImage({ title, code });
  }
  return OgTextImage({ title, category });
}

async function OgTextImage({
  title,
  category,
}: Omit<OgImageProps, 'code' | 'cover'>): Promise<Response> {
  const iconDataUrl = getIconDataUrl();

  return renderOgPng(
    <OgFrame
      cardStyle={{
        flexDirection: 'column',
        justifyContent: 'space-between',
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
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {ogTitleWords(title)}
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
            {category !== undefined && (
              <span
                style={{
                  color: '#334155',
                  fontSize: 32,
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
    </OgFrame>,
    [mPlus2Font()],
  );
}
