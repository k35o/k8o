import sharp from 'sharp';

import { OG_HEIGHT, OG_WIDTH } from './render-og-png';

// 余りの縞をならすぼかし。表紙の縁の色が余りへ滲む程度に留める
const MARGIN_BLUR_SIGMA = 24;

// 表紙の画像（AVIF など sharp が読める形）を、切らずに 1200×630 の PNG に収める。縦横比の合わない余りは、
// 表紙の縁の画素を外へ伸ばしてぼかしたもので埋め、表紙の地の色から続いて見えるようにする。表紙ごと広げて
// ぼかすと、縁の近くの文字が余りに灰色の染みとして出る
export const renderCoverOgPng = async (
  cover: Uint8Array,
): Promise<Response> => {
  const { data: slide, info } = await sharp(cover)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });
  const left = Math.floor((OG_WIDTH - info.width) / 2);
  const top = Math.floor((OG_HEIGHT - info.height) / 2);
  const extended = await sharp(slide)
    .extend({
      left,
      right: OG_WIDTH - info.width - left,
      top,
      bottom: OG_HEIGHT - info.height - top,
      extendWith: 'copy',
    })
    .toBuffer();
  const png = await sharp(extended)
    .blur(MARGIN_BLUR_SIGMA)
    .composite([{ input: slide, left, top }])
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
