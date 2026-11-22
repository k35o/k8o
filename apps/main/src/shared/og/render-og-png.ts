import { renderAsync } from '@resvg/resvg-js';
import type { ReactNode } from 'react';
import satori from 'satori';
import type { SatoriOptions } from 'satori';

// OG の画像の寸法。page-meta の og:image:width・height と同じ
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const renderOgPng = async (
  element: ReactNode,
  fonts: SatoriOptions['fonts'],
): Promise<Response> => {
  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
    // satori は渡したフォントに無い字を豆腐で描いて通すので、ビルドを止める
    loadAdditionalAsset: (code, segment): Promise<never> =>
      Promise.reject(
        new Error(`OG のフォントに字形が無い（${code}）: ${segment}`),
      ),
  });
  const png = (
    await renderAsync(svg, { font: { loadSystemFonts: false } })
  ).asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
