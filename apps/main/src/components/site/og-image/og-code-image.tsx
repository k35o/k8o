import { highlightCode } from '@repo/code-highlight/tokenize';

import { getJetBrainsMonoFont } from '@/shared/og/og-assets';
import { renderOgPng } from '@/shared/og/render-og-png';

import {
  mPlus2Font,
  OgFrame,
  OgJellyfishLegs,
  OgTitleColumn,
  ogTitleFontSize,
} from './og-frame';

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
const CODE_CHAR_WIDTH = 0.6;

// カードの幅 1100 から、余白 40 の 2 つ・間 36・パネル・題の列の左の余白 16 を引いた幅
const TITLE_AREA_WIDTH = 498;

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

export async function OgCodeImage({
  title,
  code,
}: OgCodeImageProps): Promise<Response> {
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

  const titleFontSize = ogTitleFontSize(title, {
    width: TITLE_AREA_WIDTH,
    maxHeight: 320,
    sizes: [42, 38, 34, 30],
    min: 28,
  });

  return renderOgPng(
    <OgFrame
      cardStyle={{
        gap: 36,
        padding: 40,
      }}
    >
      <OgJellyfishLegs />
      <OgTitleColumn fontSize={titleFontSize} title={title} />
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
    </OgFrame>,
    [
      mPlus2Font(),
      {
        name: 'JetBrains Mono',
        data: getJetBrainsMonoFont(),
        style: 'normal',
        weight: 400,
      },
    ],
  );
}
