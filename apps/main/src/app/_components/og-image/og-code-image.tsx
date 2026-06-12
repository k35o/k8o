import { highlightCode } from '@repo/code-highlight/tokenize';
import { loadDefaultJapaneseParser } from 'budoux';
import { ImageResponse } from 'next/og';

import { getIconDataUrl } from '@/shared/og/get-icon-data-url';
import { getJellyfishLegsDataUrl } from '@/shared/og/get-jellyfish-legs-data-url';
import { getJetBrainsMonoFont } from '@/shared/og/get-jetbrains-mono-font';
import { getMPlus2Font } from '@/shared/og/get-m-plus-2-font';

type OgCodeImageProps = {
  title: string;
  code: {
    lang: string;
    code: string;
  };
};

const PANEL_WIDTH = 470;
const PANEL_HEIGHT = 470;
const PANEL_HEADER_HEIGHT = 42;
const CODE_PADDING_X = 24;
const CODE_PADDING_Y = 20;
const CODE_LINE_HEIGHT = 1.5;
// JetBrains Monoの字送りは0.6em固定
const CODE_CHAR_WIDTH = 0.6;

// 左カラム幅: カード内幅1020 - gap36 - パネル470 - 左padding16
const TITLE_AREA_WIDTH = 498;
const TITLE_MAX_HEIGHT = 320;
const TITLE_LINE_HEIGHT = 1.35;

// 全角=1, 半角=0.55として概算し、BudouXの塊単位折り返しの空きを見込んで30%の余裕を持たせる。
// 推定4行以内に収まる最大サイズを選ぶ
const calcTitleFontSize = (title: string): number => {
  let units = 0;
  for (const char of title) {
    units += (char.codePointAt(0) ?? 0) < 128 ? 0.55 : 1;
  }
  for (const size of [42, 38, 34, 30]) {
    const lines = Math.ceil((units * 1.3 * size) / TITLE_AREA_WIDTH);
    if (lines <= 4 && lines * size * TITLE_LINE_HEIGHT <= TITLE_MAX_HEIGHT) {
      return size;
    }
  }
  return 28;
};

const calcCodeFontSize = (lineCount: number, maxLineLength: number) => {
  const areaHeight = PANEL_HEIGHT - PANEL_HEADER_HEIGHT - CODE_PADDING_Y * 2;
  const areaWidth = PANEL_WIDTH - CODE_PADDING_X * 2;
  const fitByHeight = areaHeight / (Math.max(lineCount, 1) * CODE_LINE_HEIGHT);
  const fitByWidth = areaWidth / (Math.max(maxLineLength, 1) * CODE_CHAR_WIDTH);
  return Math.max(
    11,
    Math.min(20, Math.floor(Math.min(fitByHeight, fitByWidth))),
  );
};

export async function OgCodeImage({ title, code }: OgCodeImageProps) {
  const words = loadDefaultJapaneseParser().parse(title);
  const iconDataUrl = getIconDataUrl();
  const highlighted = await highlightCode(code.code, code.lang);

  const codeLines = code.code.split('\n');
  const maxLineLength = Math.max(...codeLines.map((line) => line.length), 1);
  const codeFontSize = calcCodeFontSize(
    highlighted.tokens.length,
    maxLineLength,
  );
  const codeLineHeight = codeFontSize * CODE_LINE_HEIGHT;
  const maxVisibleLines = Math.floor(
    (PANEL_HEIGHT - PANEL_HEADER_HEIGHT - CODE_PADDING_Y * 2) / codeLineHeight,
  );
  const visibleLines = highlighted.tokens.slice(0, maxVisibleLines);

  const titleFontSize = calcTitleFontSize(title);
  const fontText = `${title}k8o`;
  const [font450, monoFont] = await Promise.all([
    getMPlus2Font({ text: fontText }),
    getJetBrainsMonoFont({ text: `${code.code}${code.lang}` }),
  ]);

  return new ImageResponse(
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
      {/* 装飾的なグラデーション円 */}
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
          gap: 36,
          padding: 40,
          borderRadius: 32,
          boxShadow: '0 25px 50px -12px #27272a',
          position: 'relative',
          overflow: 'hidden',
          opacity: 0.98,
        }}
      >
        {/* クラゲの足: サイト背景と同じ装飾をカードの左下に流す */}
        {/* ogなので */}
        <img
          alt=""
          height={230}
          src={getJellyfishLegsDataUrl('bottom-left')}
          style={{ position: 'absolute', bottom: 0, left: 0 }}
          width={230}
        />
        {/* 左カラム: タイトルとブランド */}
        {/* flexBasis 0 + minWidth 0 がないとタイトルのmax-content幅でパネルが押し出される */}
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
              fontSize: titleFontSize,
              fontWeight: 450,
              lineHeight: TITLE_LINE_HEIGHT,
              letterSpacing: '-0.02em',
            }}
          >
            {words.map((word, index) => (
              <span
                key={`${word}-${index.toString()}`}
                style={{
                  display: 'block',
                  color: '#0f172a',
                }}
              >
                {word}
              </span>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* ogなので */}
            <img
              alt="アイコン"
              height={72}
              src={iconDataUrl}
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
                fontWeight: 450,
              }}
            >
              k8o
            </span>
          </div>
        </div>
        {/* 右カラム: エディタ風コードパネル */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            flexShrink: 0,
            borderRadius: 20,
            backgroundColor: '#21252b',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: PANEL_HEADER_HEIGHT,
              paddingLeft: 20,
              paddingRight: 20,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 9999,
                  background: '#ff5f57',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 9999,
                  background: '#febc2e',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 9999,
                  background: '#28c840',
                  display: 'flex',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: '"JetBrains Mono"',
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {code.lang}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingTop: CODE_PADDING_Y,
              paddingBottom: CODE_PADDING_Y,
              paddingLeft: CODE_PADDING_X,
              paddingRight: CODE_PADDING_X,
              fontFamily: '"JetBrains Mono"',
              fontSize: codeFontSize,
            }}
          >
            {visibleLines.map((line, lineIndex) => (
              <div
                key={`line-${lineIndex.toString()}`}
                style={{
                  display: 'flex',
                  height: codeLineHeight,
                  alignItems: 'center',
                }}
              >
                {line.map((token, tokenIndex) => (
                  <span
                    key={`${lineIndex.toString()}-${tokenIndex.toString()}`}
                    style={{
                      color: token.color ?? highlighted.fg,
                      whiteSpace: 'pre',
                    }}
                  >
                    {token.content}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'M PLUS 2',
          data: font450,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'JetBrains Mono',
          data: monoFont,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
