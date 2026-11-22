import { renderAsync } from '@resvg/resvg-js';
import type { ReactNode } from 'react';
import satori from 'satori';
import type { SatoriOptions } from 'satori';

const WIDTH = 1200;
const HEIGHT = 630;

export const renderOgPng = async (
  element: ReactNode,
  fonts: SatoriOptions['fonts'],
): Promise<Response> => {
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
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
