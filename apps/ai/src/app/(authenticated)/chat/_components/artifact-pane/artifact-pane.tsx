'use client';

import {
  Alert,
  Badge,
  CloseIcon,
  FullscreenIcon,
  IconButton,
  ListBox,
} from '@k8ordo/ui';
import type { FC, MouseEvent, ReactNode, Ref } from 'react';

import { useHighlightedCode } from '@/app/_components/highlighted-code';
import type { HighlightFn } from '@/app/_components/highlighted-code';
import { SpecPreview } from '@/app/_components/spec-preview';
import type {
  ArtifactKind,
  PaneArtifact,
  PaneVersion,
} from '@/features/agent/application/chat-artifacts';
import { specToTsx } from '@/features/generation/application/spec-to-tsx';

import { CodeView } from '../../../_components/code-view';
import { CopyCodeButton } from '../../../_components/copy-code-button';
import { DeckPreview } from '../../../_components/deck-preview';
import { PreviewLoading } from '../../../_components/preview-loading';
import { ViewTabs } from '../../../_components/view-tabs';
import { ARTIFACT_VIEW_OPTIONS } from './artifact-views';
import type { ArtifactView } from './artifact-views';

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

// 生成物のリンクとフォームで会話の画面ごと移動すると、受信が切れて会話を見失うので、移動だけを止める。
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
const codeOf = (artifact: PaneArtifact, view: ArtifactView): string | null => {
  if (view === 'preview') {
    return null;
  }
  if (artifact.kind === 'slides') {
    return artifact.source;
  }
  if (artifact.spec === null) {
    return null;
  }
  return view === 'tsx'
    ? specToTsx(artifact.spec)
    : JSON.stringify(artifact.spec, null, 2);
};

const codeLangOf = (kind: ArtifactKind, view: ArtifactView): string => {
  if (kind === 'slides') {
    return 'markdown';
  }
  return view === 'tsx' ? 'tsx' : 'json';
};

const previewOf = (
  artifact: PaneArtifact,
  isGenerating: boolean,
): ReactNode => {
  if (artifact.kind === 'slides') {
    return artifact.source === null ? (
      <PreviewLoading message={artifact.text} />
    ) : (
      <DeckPreview
        isStreaming={isGenerating}
        printable={false}
        source={artifact.source}
      />
    );
  }
  return artifact.spec === null ? (
    <PreviewLoading message={artifact.text} />
  ) : (
    <SpecPreview loading={isGenerating} spec={artifact.spec} />
  );
};

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
  const highlighted = useHighlightedCode(
    code,
    isGenerating,
    codeLangOf(artifact.kind, view),
    highlight,
  );
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
      <div className={styles.body} key={artifact.toolCallId}>
        {/* 生成 UI の入力やスライドの位置を残すよう、コードを見ているあいだもアンマウントせずに隠す */}
        <div
          className={styles.preview}
          data-active={view === 'preview'}
          onClickCapture={preventLinkNavigation}
          onSubmitCapture={(event) => {
            event.preventDefault();
          }}
        >
          {previewOf(artifact, isGenerating)}
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
