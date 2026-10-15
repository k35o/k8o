'use client';

import { Button, FullscreenIcon, IconButton } from '@k8ordo/ui';
import type { FC } from 'react';

import { DEFAULT_GENERATION_MODEL } from '@/shared/claude/models';

import { ChatPanel } from '../../../_components/chat-panel';
import { CopyCodeButton } from '../../../_components/copy-code-button';
import { ProjectTitle } from '../../../_components/project-title';
import { StudioPanes } from '../../../_components/studio-panes';
import { ToolHeader } from '../../../_components/tool-frame';
import { ViewTabs } from '../../../_components/view-tabs';
import { DeckPreview } from '../deck-preview';
import {
  MOBILE_TAB_OPTIONS,
  NEW_PROJECT_EMPTY_STATE,
  VIEW_OPTIONS,
} from './new-project';

import styles from './slides-placeholder.module.css';

const ignore = (): void => undefined;

// 新しいスライドには読み込む中身が無いので、セッションを確かめるあいだも骨組みではなく、
// 確かめ終えた画面と同じ空の画面を出す。確かめ終えるまでは操作を受け付けない
export const SlidesPlaceholder: FC = () => (
  <>
    <ToolHeader>
      <ProjectTitle
        newProjectLabel="新しいスライド"
        pendingTitle={null}
        projectId={null}
        projectTitle={null}
      />
      <div className={styles.inert} inert>
        <div className={styles.viewTabs}>
          <ViewTabs onChange={ignore} options={VIEW_OPTIONS} value="preview" />
        </div>
        <div className={styles.actions}>
          <div className={styles.desktopActions}>
            <Button color="base" disabled size="sm" variant="outline">
              PDF出力
            </Button>
            <CopyCodeButton code={null} />
            <IconButton color="base" disabled label="全画面" size="sm">
              <FullscreenIcon size="sm" />
            </IconButton>
          </div>
        </div>
      </div>
    </ToolHeader>
    <div className={styles.inert} inert>
      <div className={styles.mobileTabs}>
        <ViewTabs onChange={ignore} options={MOBILE_TAB_OPTIONS} value="chat" />
      </div>
      <StudioPanes
        chat={
          <ChatPanel
            emptyStateHint={NEW_PROJECT_EMPTY_STATE.hint}
            emptyStateTitle={NEW_PROJECT_EMPTY_STATE.title}
            errorText={null}
            generatingStatus=""
            input=""
            inputPlaceholder="作りたいスライドを入力（例: TypeScript 入門の LT 資料）"
            messages={[]}
            onInputChange={ignore}
            onSelectModel={ignore}
            onStop={ignore}
            onSubmit={ignore}
            selectedModel={DEFAULT_GENERATION_MODEL}
            status="ready"
            suggestions={NEW_PROJECT_EMPTY_STATE.suggestions}
          />
        }
        mobilePane="chat"
        panel={
          <div className={styles.frame}>
            <div className={styles.preview}>
              <DeckPreview isStreaming={false} source={null} />
            </div>
          </div>
        }
      />
    </div>
  </>
);
