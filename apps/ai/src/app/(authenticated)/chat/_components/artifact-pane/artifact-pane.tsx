'use client';

import { Alert, Badge, CloseIcon, IconButton } from '@k8ordo/ui';
import type { FC, MouseEvent, Ref } from 'react';

import { SpecPreview } from '@/app/_components/spec-preview';
import type { PaneArtifactView } from '@/features/agent/application/ui-artifacts';

import { PreviewLoading } from '../../../_components/preview-loading';

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

type ArtifactPaneProps = {
  artifact: PaneArtifactView;
  onClose: () => void;
  headingRef?: Ref<HTMLHeadingElement> | undefined;
};

export const ArtifactPane: FC<ArtifactPaneProps> = ({
  artifact,
  onClose,
  headingRef,
}) => {
  const isGenerating = artifact.state === 'generating';
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
      <div
        className={styles.preview}
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
    </section>
  );
};
