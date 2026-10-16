'use client';

import type { Spec } from '@json-render/core';
import type { FC, MouseEvent, ReactNode } from 'react';

import { useHighlightedCode } from '@/app/_components/highlighted-code';
import type { HighlightFn } from '@/app/_components/highlighted-code';
import { SpecPreview } from '@/app/_components/spec-preview';
import { specToTsx } from '@/features/generation/application/spec-to-tsx';

import { CodeView } from '../code-view';
import { DeckPreview } from '../deck-preview';
import { PreviewLoading } from '../preview-loading';
import type { ArtifactView } from './artifact-views';

import styles from './artifact-body.module.css';

type ArtifactContent =
  | { kind: 'ui'; spec: Spec | null }
  | { kind: 'slides'; source: string | null };

// 生成物のリンクとフォームで画面ごと移動すると、会話の画面では受信が切れて会話を見失うので、移動だけを止める。
// 伝播は止めないので、生成 UI 側のハンドラはそのまま動く。/s/[slug] ではリンクが動いてよいので、共有の SpecPreview には入れない
const preventLinkNavigation = (event: MouseEvent): void => {
  if (
    event.target instanceof Element &&
    event.target.closest('a[href]') !== null
  ) {
    event.preventDefault();
  }
};

// 見ていないビューのコードは作らない。TSX への変換は spec が届くたびに走るため
export const codeOf = (
  content: ArtifactContent,
  view: ArtifactView,
): string | null => {
  if (view === 'preview') {
    return null;
  }
  if (content.kind === 'slides') {
    return content.source;
  }
  if (content.spec === null) {
    return null;
  }
  return view === 'tsx'
    ? specToTsx(content.spec)
    : JSON.stringify(content.spec, null, 2);
};

const codeLangOf = (
  kind: ArtifactContent['kind'],
  view: ArtifactView,
): string => {
  if (kind === 'slides') {
    return 'markdown';
  }
  return view === 'tsx' ? 'tsx' : 'json';
};

const previewOf = (
  content: ArtifactContent,
  waitingText: string,
  isGenerating: boolean,
): ReactNode => {
  if (content.kind === 'slides') {
    return content.source === null ? (
      <PreviewLoading message={waitingText} />
    ) : (
      <DeckPreview
        isStreaming={isGenerating}
        printable={false}
        source={content.source}
      />
    );
  }
  return content.spec === null ? (
    <PreviewLoading message={waitingText} />
  ) : (
    <SpecPreview loading={isGenerating} spec={content.spec} />
  );
};

type ArtifactBodyProps = {
  content: ArtifactContent;
  waitingText: string;
  isGenerating: boolean;
  view: ArtifactView;
  // Storybook から server action を辿らないよう、呼び出し側から渡す。null ならハイライトしない
  highlight: HighlightFn | null;
};

export const ArtifactBody: FC<ArtifactBodyProps> = ({
  content,
  waitingText,
  isGenerating,
  view,
  highlight,
}) => {
  const code = codeOf(content, view);
  const highlighted = useHighlightedCode(
    code,
    isGenerating,
    codeLangOf(content.kind, view),
    highlight,
  );
  return (
    <div className={styles.root}>
      {/* 生成 UI の入力やスライドの位置を残すよう、コードを見ているあいだもアンマウントせずに隠す */}
      <div
        className={styles.preview}
        data-active={view === 'preview'}
        onClickCapture={preventLinkNavigation}
        onSubmitCapture={(event) => {
          event.preventDefault();
        }}
      >
        {previewOf(content, waitingText, isGenerating)}
      </div>
      <div className={styles.code} data-active={view !== 'preview'}>
        <CodeView
          code={code}
          emptyText={waitingText}
          highlighted={highlighted}
        />
      </div>
    </div>
  );
};
