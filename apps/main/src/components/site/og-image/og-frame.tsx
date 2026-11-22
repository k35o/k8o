import { loadDefaultJapaneseParser } from 'budoux';
import type { CSSProperties, ReactNode } from 'react';
import type { SatoriOptions } from 'satori';

import { getJellyfishLegsDataUrl } from '@/shared/og/get-jellyfish-legs-data-url';
import { getIconDataUrl, getMPlus2Font } from '@/shared/og/og-assets';

export const mPlus2Font = (): SatoriOptions['fonts'][number] => ({
  name: 'M PLUS 2',
  data: getMPlus2Font(),
  style: 'normal',
  weight: 400,
});

const TITLE_LINE_HEIGHT = 1.35;

// 題の字の大きさ。幅に 4 行までで、高さに収まる大きさを sizes の大きいほうから選び、どれも収まらなければ min
export const ogTitleFontSize = (
  title: string,
  {
    width,
    maxHeight,
    sizes,
    min,
  }: { width: number; maxHeight: number; sizes: number[]; min: number },
): number => {
  let units = 0;
  for (const char of title) {
    units += (char.codePointAt(0) ?? 0) < 128 ? 0.55 : 1;
  }
  for (const size of sizes) {
    const lines = Math.ceil((units * 1.3 * size) / width);
    if (lines <= 4 && lines * size * TITLE_LINE_HEIGHT <= maxHeight) {
      return size;
    }
  }
  return min;
};

// satori は配列を返す関数コンポーネントを描けないので、呼び出して要素の並びを置く
const ogTitleWords = (title: string): ReactNode[] =>
  loadDefaultJapaneseParser()
    .parse(title)
    .map((word, index) => (
      <span
        key={`${word}-${index.toString()}`}
        style={{
          display: 'block',
          color: '#0f172a',
        }}
      >
        {word}
      </span>
    ));

export function OgFrame({
  cardStyle,
  children,
}: {
  cardStyle: CSSProperties;
  children: ReactNode;
}): ReactNode {
  return (
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
          borderRadius: 32,
          boxShadow: '0 25px 50px -12px #27272a',
          position: 'relative',
          overflow: 'hidden',
          opacity: 0.98,
          ...cardStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// カードの左下に敷くクラゲの足
export function OgJellyfishLegs(): ReactNode {
  return (
    <img
      alt=""
      height={230}
      src={getJellyfishLegsDataUrl()}
      style={{ position: 'absolute', bottom: 0, left: 0 }}
      width={230}
    />
  );
}

// カードの左の列。上に題、下にアイコンと名前を置く
export function OgTitleColumn({
  title,
  fontSize,
}: {
  title: string;
  fontSize: number;
}): ReactNode {
  return (
    // flexBasis 0 + minWidth 0 がないと、横に並べた部品を題の max-content 幅で押し出す
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 0,
        paddingTop: 24,
        paddingBottom: 8,
        paddingLeft: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          color: '#0f172a',
          fontSize,
          lineHeight: TITLE_LINE_HEIGHT,
          letterSpacing: '-0.02em',
        }}
      >
        {ogTitleWords(title)}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <img
          alt="アイコン"
          height={72}
          src={getIconDataUrl()}
          style={{
            borderRadius: 9999,
            objectFit: 'cover',
            boxShadow: '0 10px 25px -5px #27272a',
          }}
          width={72}
        />
        <span
          style={{
            color: '#18181b',
            fontSize: 36,
          }}
        >
          k8o
        </span>
      </div>
    </div>
  );
}
