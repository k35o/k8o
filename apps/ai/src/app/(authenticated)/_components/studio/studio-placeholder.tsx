'use client';

import { FullscreenIcon, IconButton } from '@k8ordo/ui';
import type { FC } from 'react';

import { DEFAULT_GENERATION_MODEL } from '@/shared/claude/models';

import { ChatPanel } from '../chat-panel';
import { CopyCodeButton } from '../copy-code-button';
import { ProjectTitle } from '../project-title';
import { StudioPanes } from '../studio-panes';
import { ToolHeader } from '../tool-frame';
import { ViewTabs } from '../view-tabs';
import {
  MOBILE_TAB_OPTIONS,
  NEW_PROJECT_EMPTY_STATE,
  VIEW_OPTIONS,
} from './new-project';

const ignore = (): void => undefined;

// 新しいプロジェクトには読み込む中身が無いので、セッションを確かめるあいだも骨組みではなく、
// 確かめ終えた画面と同じ空の画面を出す。確かめ終えるまでは操作を受け付けない
export const StudioPlaceholder: FC = () => (
  <>
    <ToolHeader>
      <ProjectTitle
        newProjectLabel="新しいプロジェクト"
        pendingTitle={null}
        projectId={null}
        projectTitle={null}
      />
      <div className="contents" inert>
        <div className="hidden gap-2 lg:flex">
          <ViewTabs onChange={ignore} options={VIEW_OPTIONS} value="preview" />
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:ml-auto">
          <div className="hidden items-center gap-3 lg:flex">
            <CopyCodeButton code={null} />
            <IconButton color="base" disabled label="全画面" size="sm">
              <FullscreenIcon size="sm" />
            </IconButton>
          </div>
        </div>
      </div>
    </ToolHeader>
    <div className="contents" inert>
      <div className="flex gap-2 px-4 py-2 lg:hidden">
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
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="bg-bg-surface relative h-full">
              <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
                生成すると、ここにライブプレビューが表示されます
              </div>
            </div>
          </div>
        }
      />
    </div>
  </>
);
