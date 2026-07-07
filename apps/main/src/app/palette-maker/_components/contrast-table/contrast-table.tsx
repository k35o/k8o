import type { FC } from 'react';

import type { PaletteSwatch } from '../../_types/palette';

type Props = {
  swatches: readonly PaletteSwatch[];
};

const AA_NORMAL_TEXT = 4.5;

type ContrastValueProps = {
  hex: string;
  text: 'white' | 'black';
  ratio: number;
  apca: number;
};

const ContrastValue: FC<ContrastValueProps> = ({ hex, text, ratio, apca }) => (
  <div className="flex items-center gap-2">
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-bold"
      style={{
        backgroundColor: hex,
        color: text === 'white' ? '#ffffff' : '#000000',
      }}
    >
      Aa
    </span>
    <div className="flex flex-col">
      <span
        className={`text-sm font-bold ${
          ratio >= AA_NORMAL_TEXT ? 'text-fg-success' : 'text-fg-error'
        }`}
      >
        {ratio.toFixed(2)}
      </span>
      <span className="text-fg-mute text-xs">Lc {apca.toFixed(1)}</span>
    </div>
  </div>
);

export const ContrastTable: FC<Props> = ({ swatches }) => (
  <div className="flex flex-col gap-2">
    <div className="border-border-base bg-bg-base overflow-hidden rounded-xl border">
      <div className="sm:hidden">
        {swatches.map((swatch) => (
          <div
            className="border-border-base flex flex-col gap-3 border-b p-4 last:border-b-0"
            key={swatch.step}
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="border-border-base size-6 shrink-0 rounded-md border"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="text-fg-base font-bold">{swatch.step}</span>
              <span className="text-fg-mute font-mono text-xs">
                {swatch.hex}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-fg-mute text-xs">白文字</span>
                <ContrastValue
                  apca={swatch.apcaWhite}
                  hex={swatch.hex}
                  ratio={swatch.contrastWhite}
                  text="white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-fg-mute text-xs">黒文字</span>
                <ContrastValue
                  apca={swatch.apcaBlack}
                  hex={swatch.hex}
                  ratio={swatch.contrastBlack}
                  text="black"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <table className="hidden w-full sm:table">
        <thead>
          <tr className="border-border-base bg-bg-mute border-b text-left text-sm font-medium">
            <th className="px-4 py-3">段</th>
            <th className="px-4 py-3">色</th>
            <th className="px-4 py-3">OKLCH</th>
            <th className="px-4 py-3">白文字</th>
            <th className="px-4 py-3">黒文字</th>
          </tr>
        </thead>
        <tbody>
          {swatches.map((swatch) => (
            <tr
              className="border-border-base border-b last:border-b-0"
              key={swatch.step}
            >
              <td className="text-fg-base px-4 py-2 font-bold">
                {swatch.step}
              </td>
              <td className="text-fg-mute px-4 py-2 font-mono text-xs">
                <span
                  aria-hidden="true"
                  className="border-border-base mr-2 inline-block size-6 rounded-md border align-middle"
                  style={{ backgroundColor: swatch.hex }}
                />
                {swatch.hex}
              </td>
              <td className="text-fg-mute px-4 py-2 font-mono text-xs">
                {swatch.cssOklch}
              </td>
              <td className="px-4 py-2">
                <ContrastValue
                  apca={swatch.apcaWhite}
                  hex={swatch.hex}
                  ratio={swatch.contrastWhite}
                  text="white"
                />
              </td>
              <td className="px-4 py-2">
                <ContrastValue
                  apca={swatch.apcaBlack}
                  hex={swatch.hex}
                  ratio={swatch.contrastBlack}
                  text="black"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="text-fg-mute text-xs">
      WCAG比は4.5以上（通常テキストのAA基準）を合格として色分けしています
    </p>
  </div>
);
