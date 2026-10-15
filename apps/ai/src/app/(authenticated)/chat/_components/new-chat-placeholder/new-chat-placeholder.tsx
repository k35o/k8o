'use client';

import type { FC } from 'react';

import { DEFAULT_GENERATION_MODEL } from '@/shared/claude/models';

import { ToolHeader } from '../../../_components/tool-frame';
import { ChatHeader, ChatView } from '../chat-view';

import styles from './new-chat-placeholder.module.css';

const ignore = (): void => undefined;

// 新しい会話には読み込む中身が無いので、セッションを確かめるあいだも骨組みではなく、
// 確かめ終えた画面と同じ空の会話を出す。確かめ終えるまでは操作を受け付けない
export const NewChatPlaceholder: FC = () => (
  <>
    <ToolHeader>
      <ChatHeader model={DEFAULT_GENERATION_MODEL} title={null} />
    </ToolHeader>
    <div className={styles.inert} inert>
      <ChatView
        canSelectModel
        draft=""
        errorText={null}
        isServerRunning={false}
        isStopping={false}
        messages={[]}
        model={DEFAULT_GENERATION_MODEL}
        onDraftChange={ignore}
        onSelectModel={ignore}
        onStop={ignore}
        onSubmit={ignore}
        status="ready"
      />
    </div>
  </>
);
