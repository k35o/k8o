import type { Spec } from '@json-render/core';
import { useState } from 'react';
import type { ComponentProps, FC } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';

import preview from '../../../../../../.storybook/preview';
import { ViewTabs } from '../../../_components/view-tabs';
import { ArtifactPane } from '../artifact-pane';
import { ChatView } from '../chat-view';
import { ChatPanes } from './chat-panes';
import { usePaneFocus } from './use-pane-focus';

import styles from './chat-panes.stories.module.css';

const ignore = (): void => undefined;

const PRICING: Spec = {
  root: 'page',
  elements: {
    page: {
      type: 'Stack',
      props: { direction: 'column', gap: 'lg' },
      children: ['title', 'plans'],
    },
    title: { type: 'Heading', props: { level: 'h2', label: '料金プラン' } },
    plans: {
      type: 'Grid',
      props: { cols: 3, gap: 'md' },
      children: ['free', 'pro', 'team'],
    },
    free: {
      type: 'Card',
      props: { variant: 'outline' },
      children: ['freeName'],
    },
    freeName: { type: 'Heading', props: { level: 'h3', label: 'Free' } },
    pro: { type: 'Card', props: { variant: 'outline' }, children: ['proName'] },
    proName: { type: 'Heading', props: { level: 'h3', label: 'Pro' } },
    team: {
      type: 'Card',
      props: { variant: 'outline' },
      children: ['teamName'],
    },
    teamName: { type: 'Heading', props: { level: 'h3', label: 'Team' } },
  },
};

const pricingDone = {
  toolCallId: 'ui-done',
  title: '料金プラン',
  spec: PRICING,
  text: '3つのプランを横に並べました。',
  open: 'preview',
  state: 'done',
  version: 1,
} as const;

const longConversation: AgentUIMessage[] = [
  ...Array.from({ length: 10 }, (_, index): AgentUIMessage => ({
    id: `m${index.toString()}`,
    role: index % 2 === 0 ? 'user' : 'assistant',
    parts: [
      {
        type: 'text',
        state: 'done',
        text: `${(index + 1).toString()}番目のメッセージ。会話がペインの高さを超えるまで続く。`,
      },
    ],
  })),
  {
    id: 'u-ui',
    role: 'user',
    parts: [{ type: 'text', text: '料金プランを3列で比べる UI を作って' }],
  },
  {
    id: 'a-ui',
    role: 'assistant',
    metadata: { end: 'completed' },
    parts: [
      { type: 'step-start' },
      {
        type: 'tool-generate_ui',
        toolCallId: 'ui-done',
        state: 'output-available',
        input: { title: '料金プラン', instruction: '3つのプランを比べる' },
        output: {
          status: 'done',
          artifactId: 'a1b2c3d4e5f6',
          version: 1,
          summary: '3つのプランを横に並べました。',
          spec: PRICING,
        },
      },
      { type: 'text', state: 'done', text: '料金プランの UI を作りました。' },
    ],
  },
];

const Chat: FC = () => (
  <ChatView
    canSelectModel={false}
    draft=""
    errorText={null}
    isServerRunning={false}
    isStopping={false}
    messages={longConversation}
    model="claude-sonnet-5-5"
    onDraftChange={ignore}
    onOpenArtifact={ignore}
    onSelectModel={ignore}
    onStop={ignore}
    onSubmit={ignore}
    selectedToolCallId="ui-done"
    status="ready"
  />
);

const MOBILE_PANE_OPTIONS = [
  { value: 'chat', label: 'チャット' },
  { value: 'pane', label: 'プレビュー' },
] as const;

// xl 未満のタブの切り替えは親が持つので、Story でも状態を持つ
const SwitchablePanes: FC<ComponentProps<typeof ChatPanes>> = ({
  chat,
  pane,
}) => {
  const [mobilePane, setMobilePane] = useState<'chat' | 'pane'>('chat');
  return (
    <>
      <div className={styles.tabs}>
        <ViewTabs
          onChange={setMobilePane}
          options={MOBILE_PANE_OPTIONS}
          value={mobilePane}
        />
      </div>
      <ChatPanes chat={chat} mobilePane={mobilePane} pane={pane} />
    </>
  );
};

// ChatScreen と同じく、カードで開くとペインを出して、フォーカスの行き先を移す
const FocusingPanes: FC = () => {
  const paneFocus = usePaneFocus();
  const [mobilePane, setMobilePane] = useState<'chat' | 'pane'>('chat');
  return (
    <ChatPanes
      chat={
        <ChatView
          artifactButtonRef={paneFocus.artifactButtonRef}
          canSelectModel={false}
          draft=""
          errorText={null}
          inputRef={paneFocus.inputRef}
          isServerRunning={false}
          isStopping={false}
          messages={longConversation}
          model="claude-sonnet-5-5"
          onDraftChange={ignore}
          onOpenArtifact={(toolCallId) => {
            paneFocus.openPane(toolCallId, () => {
              setMobilePane('pane');
            });
          }}
          onSelectModel={ignore}
          onStop={ignore}
          onSubmit={ignore}
          selectedToolCallId="ui-done"
          status="ready"
        />
      }
      mobilePane={mobilePane}
      pane={
        <ArtifactPane
          artifact={{ ...pricingDone, title: '料金の比較' }}
          headingRef={paneFocus.headingRef}
          highlight={null}
          onClose={ignore}
          onViewChange={ignore}
          view="preview"
        />
      }
    />
  );
};

const meta = preview.meta({
  component: ChatPanes,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  // propより狭い型（null・unionリテラル）のままargsを推論させると meta.storyの型推論が壊れるため、
  // satisfiesで文脈型を与えて広げる
  args: {
    chat: <Chat />,
    pane: (
      <ArtifactPane
        artifact={pricingDone}
        highlight={null}
        onClose={ignore}
        onViewChange={ignore}
        view="preview"
      />
    ),
    mobilePane: 'chat',
  } satisfies Partial<ComponentProps<typeof ChatPanes>>,
});

export const WithoutPane = meta.story({
  args: { pane: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('log')).toBeVisible();
    await expect(
      canvas.queryByRole('region', { name: 'UI のプレビュー' }),
    ).not.toBeInTheDocument();
  },
});

export const PaneShown = meta.story({
  args: { mobilePane: 'pane' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // テストのビューポートは xl 未満なので、1枚だけを出す
    await expect(
      canvas.getByRole('region', { name: 'UI のプレビュー' }),
    ).toBeVisible();
    await expect(canvas.queryByRole('log')).not.toBeInTheDocument();
  },
});

export const PaneGoneWhileShown = meta.story({
  args: { pane: null, mobilePane: 'pane' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // プレビューを見ているあいだにペインが無くなっても、何も出ない画面に閉じ込めず会話を出す
    await expect(canvas.getByRole('log')).toBeVisible();
    await expect(canvas.getByRole('textbox')).toBeVisible();
  },
});

export const KeepsScrollAcrossTabs = meta.story({
  render: (args) => <SwitchablePanes {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = canvas.getByRole('log');
    // 開いた直後は、中身の大きさが変わるたびに会話の底まで送られる。底を離れたと Conversation が
    // 気づくまで途中へ戻し直す。気づく前に隠すと、戻ったときに底へ送られる
    await waitFor(async () => {
      log.scrollTo({ top: 100, behavior: 'instant' });
      await expect(
        canvas.getByRole('button', { name: '最新のメッセージへ移動' }),
      ).toBeInTheDocument();
    });
    await userEvent.click(canvas.getByRole('button', { name: 'プレビュー' }));
    await expect(log).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'チャット' }));
    await expect(log).toBeVisible();
    await expect(log.scrollTop).toBe(100);
  },
});

export const FocusesPaneOnOpen = meta.story({
  render: () => <FocusingPanes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    );
    // テストのビューポートは xl 未満なので、押したボタンごと会話が隠れ、開いたペインの見出しへ移る
    await expect(
      canvas.getByRole('heading', { name: '料金の比較' }),
    ).toHaveFocus();
  },
});
