import { loadDefaultJapaneseParser } from 'budoux';
import type { CSSProperties, ReactNode } from 'react';
import type { SatoriOptions } from 'satori';

import { getMPlus2Font } from '@/shared/og/og-assets';

export const mPlus2Font = (): SatoriOptions['fonts'][number] => ({
  name: 'M PLUS 2',
  data: getMPlus2Font(),
  style: 'normal',
  weight: 400,
});

// satori は配列を返す関数コンポーネントを描けないので、呼び出して要素の並びを置く
export const ogTitleWords = (title: string): ReactNode[] =>
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
