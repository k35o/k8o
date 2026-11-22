import { renderOgPng } from '@/shared/og/render-og-png';

import { OgCodeImage } from './og-code-image';
import {
  mPlus2Font,
  OgFrame,
  OgJellyfishLegs,
  OgTitleColumn,
  ogTitleFontSize,
} from './og-frame';

type OgImageProps = {
  title: string;
  code?:
    | {
        lang: string;
        code: string;
      }
    | undefined;
};

// カードの幅 1100 から、余白 40 の 2 つと、題の列の左の余白 16 を引いた幅
const TITLE_AREA_WIDTH = 1004;

export async function OgImage({
  title,
  code,
}: OgImageProps): Promise<Response> {
  if (code) {
    return OgCodeImage({ title, code });
  }
  return OgTextImage({ title });
}

// コードの OG（OgCodeImage）から、右のコードのパネルを除いた形。題は横いっぱいに大きく描く
async function OgTextImage({ title }: { title: string }): Promise<Response> {
  return renderOgPng(
    <OgFrame cardStyle={{ padding: 40 }}>
      <OgJellyfishLegs />
      <OgTitleColumn
        fontSize={ogTitleFontSize(title, {
          width: TITLE_AREA_WIDTH,
          maxHeight: 320,
          sizes: [64, 56, 48, 42],
          min: 38,
        })}
        title={title}
      />
    </OgFrame>,
    [mPlus2Font()],
  );
}
