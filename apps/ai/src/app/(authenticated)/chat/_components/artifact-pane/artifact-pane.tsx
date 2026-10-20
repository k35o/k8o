'use client';

import {
  Alert,
  Badge,
  CloseIcon,
  FullscreenIcon,
  IconButton,
  ListBox,
  PackageIcon,
} from '@k8ordo/ui';
import Link from 'next/link';
import type { FC, Ref } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import type {
  ArtifactKind,
  PaneArtifact,
  PaneVersion,
} from '@/features/agent/application/chat-artifacts';

import {
  ARTIFACT_VIEW_OPTIONS,
  ArtifactBody,
  codeOf,
} from '../../../_components/artifact-body';
import type { ArtifactView } from '../../../_components/artifact-body';
import { CopyCodeButton } from '../../../_components/copy-code-button';
import { ViewTabs } from '../../../_components/view-tabs';

import styles from './artifact-pane.module.css';

const PANE_TEXTS = {
  ui: {
    label: 'UI のプレビュー',
    stopped:
      '保存していない、途中までの UI です。続けるときはもう一度頼んでください',
  },
  slides: {
    label: 'スライドのプレビュー',
    stopped:
      '保存していない、途中までのスライドです。続けるときはもう一度頼んでください',
  },
} as const satisfies Record<ArtifactKind, { label: string; stopped: string }>;

type ArtifactPaneProps = {
  artifact: PaneArtifact;
  versions: readonly PaneVersion[];
  onSelectVersion: (toolCallId: string) => void;
  view: ArtifactView;
  onViewChange: (view: ArtifactView) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
  // Storybook から server action を辿らないよう、呼び出し側から渡す。null ならハイライトしない
  highlight: HighlightFn | null;
  headingRef?: Ref<HTMLHeadingElement> | undefined;
};

export const ArtifactPane: FC<ArtifactPaneProps> = ({
  artifact,
  versions,
  onSelectVersion,
  view,
  onViewChange,
  expanded,
  onExpandedChange,
  onClose,
  highlight,
  headingRef,
}) => {
  const isGenerating = artifact.state === 'generating';
  const code = codeOf(artifact, view);
  return (
    <section
      aria-label={PANE_TEXTS[artifact.kind].label}
      className={styles.root}
    >
      <div className={styles.header}>
        <h2 className={styles.title} ref={headingRef} tabIndex={-1}>
          {artifact.title}
        </h2>
        {versions.length >= 2 ? (
          <div className={styles.versions}>
            <ListBox.Root
              // ListBox は今の値を選び直しても onChange を呼ぶ。追従中に今の版を選び直したとき、見た目の変わらない記録を history に積まないよう、版が変わるときだけ伝える
              onChange={(toolCallId) => {
                if (toolCallId !== artifact.toolCallId) {
                  onSelectVersion(toolCallId);
                }
              }}
              options={versions.map((version) => ({
                value: version.toolCallId,
                label: `版 ${version.version.toString()}`,
              }))}
              value={artifact.toolCallId}
            >
              <ListBox.Trigger label="表示する版" size="sm" />
              <ListBox.Content />
            </ListBox.Root>
          </div>
        ) : artifact.state === 'done' ? (
          <Badge label={`版 ${artifact.version.toString()}`} size="sm" />
        ) : null}
        {isGenerating ? (
          <p className={styles.progress}>{artifact.text}</p>
        ) : null}
        <div className={styles.actions}>
          {artifact.state === 'done' ? (
            <IconButton
              label="作ったもののページを開く"
              renderItem={({
                className,
                children,
                'aria-label': ariaLabel,
                triggerProps,
              }) => (
                <Link
                  aria-label={ariaLabel}
                  className={className}
                  href={`/artifacts/${artifact.artifactId}?v=${artifact.version.toString()}`}
                  {...triggerProps}
                >
                  {children}
                </Link>
              )}
              size="sm"
            >
              <PackageIcon size="sm" />
            </IconButton>
          ) : null}
          <div className={styles.viewTabs}>
            <ViewTabs
              onChange={onViewChange}
              options={ARTIFACT_VIEW_OPTIONS[artifact.kind]}
              value={view}
            />
          </div>
          {view === 'preview' ? null : <CopyCodeButton code={code} />}
          <div className={styles.expand}>
            <IconButton
              aria-pressed={expanded}
              color={expanded ? 'primary' : 'transparent'}
              label="全画面で見る"
              onClick={() => {
                onExpandedChange(!expanded);
              }}
              size="sm"
            >
              <FullscreenIcon size="sm" />
            </IconButton>
          </div>
          <div className={styles.close}>
            <IconButton label="プレビューを閉じる" onClick={onClose} size="sm">
              <CloseIcon size="sm" />
            </IconButton>
          </div>
        </div>
      </div>
      {artifact.state === 'stopped' ? (
        <div className={styles.notice}>
          <Alert message={PANE_TEXTS[artifact.kind].stopped} tone="warning" />
        </div>
      ) : null}
      {/* 別の呼び出しへ移ったら、生成 UI の入力やスクロール、スライドの位置を持ち越さない。
          見出しは作り直さず、新しい生成への追従や版の切り替えで、見出しのボタンのフォーカスを落とさない */}
      <ArtifactBody
        content={artifact}
        highlight={highlight}
        isGenerating={isGenerating}
        key={artifact.toolCallId}
        printable={false}
        view={view}
        waitingText={artifact.text}
      />
    </section>
  );
};
