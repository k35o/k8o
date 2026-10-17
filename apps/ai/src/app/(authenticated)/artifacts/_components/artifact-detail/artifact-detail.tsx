'use client';

import { Badge } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import type { LoadedArtifact } from '@/features/artifacts/interface/queries';

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

import styles from './artifact-detail.module.css';

const HISTORY_TAB = { value: 'history', label: '履歴' } as const;

type ArtifactDetailProps = {
  artifact: LoadedArtifact;
  // Storybook から server action を辿らないよう、呼び出し側から渡す。null ならハイライトしない
  highlight: HighlightFn | null;
};

export const ArtifactDetail: FC<ArtifactDetailProps> = ({
  artifact,
  highlight,
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
        {/* xl 未満で履歴を出しているあいだも、生成 UI の入力やスライドの位置を残すよう、本文をアンマウントせずに隠す */}
        <div className={styles.main} data-shown={!historyShown}>
          {/* 版を移ったら、生成 UI の入力やスライドの位置を持ち越さない */}
          <ArtifactBody
            content={selected}
            highlight={highlight}
            isGenerating={false}
            key={`${artifact.id}:${selected.version.toString()}`}
            view={view}
            waitingText=""
          />
        </div>
        <div className={styles.history} data-shown={historyShown}>
          <ArtifactHistory
            artifactId={artifact.id}
            selectedVersion={selected.version}
            versions={artifact.versions}
          />
        </div>
      </div>
    </>
  );
};
