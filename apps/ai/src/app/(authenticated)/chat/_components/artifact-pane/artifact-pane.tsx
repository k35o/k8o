'use client';

import type { Spec } from '@json-render/core';
import { Alert, Badge, CloseIcon, IconButton } from '@k8ordo/ui';
import type { FC, MouseEvent, Ref } from 'react';

import { useHighlightedCode } from '@/app/_components/highlighted-code';
import type { HighlightFn } from '@/app/_components/highlighted-code';
import { SpecPreview } from '@/app/_components/spec-preview';
import type { PaneArtifactView } from '@/features/agent/application/ui-artifacts';
import { specToTsx } from '@/features/generation/application/spec-to-tsx';

import { CodeView } from '../../../_components/code-view';
import { CopyCodeButton } from '../../../_components/copy-code-button';
import { PreviewLoading } from '../../../_components/preview-loading';
import { ViewTabs } from '../../../_components/view-tabs';
import { ARTIFACT_VIEW_OPTIONS } from './artifact-views';
import type { ArtifactView } from './artifact-views';

import styles from './artifact-pane.module.css';

// 生成 UI のリンクとフォームで会話の画面ごと移動すると、受信が切れて会話を見失うので、移動だけを止める。
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
const codeOf = (spec: Spec | null, view: ArtifactView): string | null => {
  if (spec === null || view === 'preview') {
    return null;
  }
  return view === 'tsx' ? specToTsx(spec) : JSON.stringify(spec, null, 2);
};

type ArtifactPaneProps = {
  artifact: PaneArtifactView;
  view: ArtifactView;
  onViewChange: (view: ArtifactView) => void;
  onClose: () => void;
  // Storybook から server action を辿らないよう、呼び出し側から渡す。null ならハイライトしない
  highlight: HighlightFn | null;
  headingRef?: Ref<HTMLHeadingElement> | undefined;
};

export const ArtifactPane: FC<ArtifactPaneProps> = ({
  artifact,
  view,
  onViewChange,
  onClose,
  highlight,
  headingRef,
}) => {
  const isGenerating = artifact.state === 'generating';
  const code = codeOf(artifact.spec, view);
  const highlighted = useHighlightedCode(
    code,
    isGenerating,
    view === 'tsx' ? 'tsx' : 'json',
    highlight,
  );
  return (
    <section aria-label="UI のプレビュー" className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title} ref={headingRef} tabIndex={-1}>
          {artifact.title}
        </h2>
        {artifact.state === 'done' ? (
          <Badge label={`版 ${artifact.version.toString()}`} size="sm" />
        ) : null}
        {isGenerating ? (
          <p className={styles.progress}>{artifact.text}</p>
        ) : null}
        <div className={styles.actions}>
          <div className={styles.viewTabs}>
            <ViewTabs
              onChange={onViewChange}
              options={ARTIFACT_VIEW_OPTIONS}
              value={view}
            />
          </div>
          {view === 'preview' ? null : <CopyCodeButton code={code} />}
          <div className={styles.close}>
            <IconButton label="プレビューを閉じる" onClick={onClose} size="sm">
              <CloseIcon size="sm" />
            </IconButton>
          </div>
        </div>
      </div>
      {artifact.state === 'stopped' ? (
        <div className={styles.notice}>
          <Alert
            message="保存していない、途中までの UI です。続けるときはもう一度頼んでください"
            tone="warning"
          />
        </div>
      ) : null}
      <div className={styles.body}>
        {/* 生成 UI の入力を残すよう、コードを見ているあいだもアンマウントせずに隠す */}
        <div
          className={styles.preview}
          data-active={view === 'preview'}
          onClickCapture={preventLinkNavigation}
          onSubmitCapture={(event) => {
            event.preventDefault();
          }}
        >
          {artifact.spec === null ? (
            <PreviewLoading message={artifact.text} />
          ) : (
            <SpecPreview loading={isGenerating} spec={artifact.spec} />
          )}
        </div>
        <div className={styles.code} data-active={view !== 'preview'}>
          <CodeView
            code={code}
            emptyText={artifact.text}
            highlighted={highlighted}
          />
        </div>
      </div>
    </section>
  );
};
