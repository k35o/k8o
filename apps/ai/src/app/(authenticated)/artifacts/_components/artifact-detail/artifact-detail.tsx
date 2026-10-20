'use client';

import { AssistantIcon, Badge, Button } from '@k8ordo/ui';
import Link from 'next/link';
import { useState } from 'react';
import type { FC } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import type { ArtifactForRoute } from '@/features/artifacts/interface/queries';

import {
  ARTIFACT_VIEW_OPTIONS,
  ArtifactBody,
  codeOf,
} from '../../../_components/artifact-body';
import type { ArtifactView } from '../../../_components/artifact-body';
import { ArtifactKindBadge } from '../../../_components/artifact-kind-badge';
import { CopyCodeButton } from '../../../_components/copy-code-button';
import { ToolHeader } from '../../../_components/tool-frame';
import { ViewTabs } from '../../../_components/view-tabs';
import { ArtifactHistory } from '../artifact-history';
import { ArtifactShareMenu } from '../artifact-share-menu';
import type { ArtifactShareActions } from '../artifact-share-menu';

import styles from './artifact-detail.module.css';

const HISTORY_TAB = { value: 'history', label: '履歴' } as const;

// UI とスライドの artifactId は別もので、Claude が generate_ui と generate_slides のどちらで直すかを選べるよう、種類も書く
const DRAFT_KINDS = {
  ui: 'UI',
  slides: 'スライド',
} as const satisfies Record<ArtifactForRoute['kind'], string>;

const editDraftOf = (
  artifactId: string,
  selected: ArtifactForRoute['selected'],
): string =>
  `${DRAFT_KINDS[selected.kind]}「${selected.title}」（artifactId: ${artifactId}）の版 ${selected.version.toString()} を土台に、`;

// highlight と shareActions は、Storybook から server action を辿らないよう、呼び出し側から渡す
type ArtifactDetailProps = {
  artifact: ArtifactForRoute;
  // null ならハイライトしない
  highlight: HighlightFn | null;
  shareActions: ArtifactShareActions;
};

export const ArtifactDetail: FC<ArtifactDetailProps> = ({
  artifact,
  highlight,
  shareActions,
}) => {
  const [view, setView] = useState<ArtifactView>('preview');
  const [historyShown, setHistoryShown] = useState(false);
  const { selected } = artifact;
  const code = codeOf(selected, view);
  return (
    <>
      <ToolHeader>
        <h1 className={styles.title}>{selected.title}</h1>
        <ArtifactKindBadge kind={artifact.kind} />
        <Badge label={`版 ${selected.version.toString()}`} size="sm" />
        <div className={styles.actions}>
          <div className={styles.viewTabs}>
            <ViewTabs
              onChange={setView}
              options={ARTIFACT_VIEW_OPTIONS[artifact.kind]}
              value={view}
            />
          </div>
          {view === 'preview' ? null : <CopyCodeButton code={code} />}
          {selected.kind === 'slides' ? (
            <Button
              color="base"
              onClick={() => {
                window.print();
              }}
              size="sm"
              variant="outline"
            >
              PDF出力
            </Button>
          ) : null}
          <Button
            color="base"
            renderItem={({ className, children }) => (
              <Link
                className={className}
                href={{
                  pathname: '/chat',
                  query: { draft: editDraftOf(artifact.id, selected) },
                }}
              >
                {children}
              </Link>
            )}
            size="sm"
            startIcon={<AssistantIcon size="sm" />}
            variant="outline"
          >
            新しいチャットで直す
          </Button>
          <ArtifactShareMenu
            actions={shareActions}
            artifactId={artifact.id}
            selectedVersion={selected.version}
            share={artifact.share}
          />
        </div>
      </ToolHeader>
      <div className={styles.mobileTabs}>
        <ViewTabs
          onChange={(tab) => {
            if (tab === 'history') {
              setHistoryShown(true);
              return;
            }
            setView(tab);
            setHistoryShown(false);
          }}
          options={[...ARTIFACT_VIEW_OPTIONS[artifact.kind], HISTORY_TAB]}
          value={historyShown ? 'history' : view}
        />
      </div>
      <div className={styles.body}>
        {/* xl 未満で履歴を出しているあいだも、生成 UI の入力やスライドの位置と印刷用のスライドを残すよう、本文をアンマウントせずに
            CSS で隠す。Activity で隠すと、印刷の規則も切れる */}
        <div className={styles.main} data-shown={!historyShown}>
          {/* 版を移ったら、生成 UI の入力やスライドの位置を持ち越さない */}
          <ArtifactBody
            content={selected}
            highlight={highlight}
            isGenerating={false}
            key={`${artifact.id}:${selected.version.toString()}`}
            printable
            view={view}
            waitingText=""
          />
        </div>
        <div className={styles.history} data-shown={historyShown}>
          <ArtifactHistory
            artifactId={artifact.id}
            publicVersion={artifact.share?.version ?? null}
            selectedVersion={selected.version}
            versions={artifact.versions}
          />
        </div>
      </div>
    </>
  );
};
