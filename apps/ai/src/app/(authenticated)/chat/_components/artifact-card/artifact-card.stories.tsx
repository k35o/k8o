import type { Spec } from '@json-render/core';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import {
  artifactErrorText,
  chatArtifactOf,
} from '@/features/agent/application/chat-artifacts';
import type {
  ArtifactLive,
  ChatArtifact,
} from '@/features/agent/application/chat-artifacts';

import preview from '../../../../../../.storybook/preview';
import { ArtifactCard } from './artifact-card';

const PRICING: Spec = {
  root: 'title',
  elements: {
    title: { type: 'Heading', props: { level: 'h2', label: '料金プラン' } },
  },
};

const meta = preview.meta({
  component: ArtifactCard,
  // propより狭い型（unionリテラル）のままargsを推論させると meta.storyの型推論が壊れるため、
  // satisfiesで文脈型を与えて広げる
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-done',
      title: '料金プラン',
      spec: PRICING,
      text: '3つのプランを横に並べました。',
      open: 'preview',
      state: 'done',
      artifactId: 'a1b2c3d4e5f6',
      version: 2,
    },
    isActive: false,
    onOpen: fn<() => void>(),
  } satisfies Partial<ComponentProps<typeof ArtifactCard>>,
});

export const Done = meta.story({
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('料金プラン')).toBeInTheDocument();
    await expect(canvas.getByText('版 2')).toBeInTheDocument();
    await expect(
      canvas.getByText('3つのプランを横に並べました。'),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    );
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
});

export const Shown = meta.story({
  args: { isActive: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // テストのビューポートは xl 未満で、カードとペインは同時に見えないので、表示中とは出さない
    await expect(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('表示中')).not.toBeVisible();
  },
});

export const Preparing = meta.story({
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-input',
      title: '料金',
      spec: null,
      text: '準備しています…',
      open: null,
      state: 'generating',
      editingVersion: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', { name: '準備しています…' }),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});

export const Editing = meta.story({
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-repairing',
      title: '料金プラン',
      spec: PRICING,
      text: '検証エラーを直しています…',
      open: 'preview',
      state: 'generating',
      editingVersion: 2,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('版 2 を直しています')).toBeInTheDocument();
    await expect(
      canvas.getByRole('status', { name: '検証エラーを直しています…' }),
    ).toBeInTheDocument();
    // 版になるまでは版の Badge を出さない
    await expect(canvas.queryByText('版 2')).not.toBeInTheDocument();
  },
});

export const Waiting = meta.story({
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-waiting',
      title: '料金プラン',
      spec: null,
      text: '生成を続けています。終わると最新に置き換わります',
      open: null,
      state: 'generating',
      editingVersion: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', {
        name: '生成を続けています。終わると最新に置き換わります',
      }),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});

export const Stopped = meta.story({
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-stopped',
      title: '料金プラン',
      spec: PRICING,
      text: '途中で止まりました',
      open: 'partial',
      state: 'stopped',
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('途中で止まりました')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: '途中までを見る' }),
    );
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
});

export const Failed = meta.story({
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-failed',
      title: '料金プラン',
      spec: null,
      text: '時間の上限に達したため止まりました',
      open: null,
      state: 'failed',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('時間の上限に達したため止まりました'),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});

// 修復しても通らなかった検証エラーの errorText。指摘は1件ずつ 120 文字で切られて3件まで並ぶ
const unfixedIssue = (key: string): string =>
  `[${key}] Unknown component type "DataGrid". Use one of: Stack, Grid, Button, Card, Badge, Heading, Alert, Callout, Spinner, S…`;
const UNFIXED_ERROR_TEXT = `Error: UI の検証エラーを直せませんでした: ${[unfixedIssue('a'), unfixedIssue('b'), unfixedIssue('c')].join(' / ')}`;

export const FailedWithLongReason = meta.story({
  args: {
    artifact: {
      kind: 'ui',
      toolCallId: 'ui-failed-long',
      title: '料金プラン',
      spec: null,
      text: artifactErrorText(UNFIXED_ERROR_TEXT),
      open: null,
      state: 'failed',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 長いエラーの文は、会話に流しすぎないよう切って出す
    await expect(
      canvas.getByText(
        /^UI の検証エラーを直せませんでした: \[a\] .*\[c\] .*…$/u,
      ),
    ).toBeVisible();
  },
});

type SlidesToolPart = Extract<
  AgentUIMessage['parts'][number],
  { type: 'tool-generate_slides' }
>;

const DECK = ['<Cover>', '# TypeScript 入門', '</Cover>'].join('\n');
const SLIDES_INPUT = {
  title: 'TypeScript 入門',
  instruction: '型の基礎を5枚で',
};

const slidesParts = {
  input: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-input',
    state: 'input-available',
    input: SLIDES_INPUT,
  },
  thinking: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-thinking',
    state: 'output-available',
    preliminary: true,
    input: SLIDES_INPUT,
    output: { status: 'generating', phase: 'thinking', source: null },
  },
  writing: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-writing',
    state: 'output-available',
    preliminary: true,
    input: {
      ...SLIDES_INPUT,
      base: { artifactId: 's1t2u3v4w5x6', version: 1 },
    },
    output: { status: 'generating', phase: 'writing', source: DECK },
  },
  done: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-done',
    state: 'output-available',
    input: SLIDES_INPUT,
    output: {
      status: 'done',
      artifactId: 's1t2u3v4w5x6',
      version: 2,
      summary: '型の基礎を5枚にまとめました。',
      source: DECK,
    },
  },
  failed: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-failed',
    state: 'output-error',
    input: SLIDES_INPUT,
    errorText:
      'Error: スライドを読み取れませんでした: スライドが1枚もありません',
  },
} satisfies Record<string, SlidesToolPart>;

// スライドのカードは会話のパーツから導いて描き、パーツの状態ごとの出し分けまで確かめる
const slides = (
  part: SlidesToolPart,
  live: ArtifactLive = 'receiving',
  isStopping = false,
): ChatArtifact => chatArtifactOf(part, { live, isStopping });

export const SlidesPreparing = meta.story({
  args: { artifact: slides(slidesParts.input) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('TypeScript 入門')).toBeInTheDocument();
    await expect(
      canvas.getByRole('status', { name: '準備しています…' }),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});

export const SlidesThinking = meta.story({
  args: { artifact: slides(slidesParts.thinking) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', { name: '考えています…' }),
    ).toBeInTheDocument();
    // 受信しているあいだは、デッキが届く前でもペインを開ける
    await expect(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    ).toBeInTheDocument();
  },
});

export const SlidesWriting = meta.story({
  args: { artifact: slides(slidesParts.writing) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('版 1 を直しています')).toBeInTheDocument();
    await expect(
      canvas.getByRole('status', { name: 'スライドを書いています…' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    ).toBeInTheDocument();
  },
});

export const SlidesWaitingWhileThinking = meta.story({
  args: { artifact: slides(slidesParts.thinking, 'waiting') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', {
        name: '生成を続けています。終わると最新に置き換わります',
      }),
    ).toBeInTheDocument();
    // 受信が切れたまま、まだ1枚も書けていないので、開くものが無い
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});

export const SlidesStopping = meta.story({
  args: { artifact: slides(slidesParts.writing, 'receiving', true) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', { name: '停止しています…' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    ).toBeInTheDocument();
  },
});

export const SlidesDone = meta.story({
  args: { artifact: slides(slidesParts.done, null) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('TypeScript 入門')).toBeInTheDocument();
    await expect(canvas.getByText('版 2')).toBeInTheDocument();
    await expect(
      canvas.getByText('型の基礎を5枚にまとめました。'),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'プレビューを開く' }),
    );
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
});

export const SlidesStoppedWhileThinking = meta.story({
  args: { artifact: slides(slidesParts.thinking, null) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('途中で止まりました')).toBeInTheDocument();
    // 1枚も書く前に止まったものは、見せる途中のデッキが無い
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});

export const SlidesStoppedWhileWriting = meta.story({
  args: { artifact: slides(slidesParts.writing, null) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('途中で止まりました')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: '途中までを見る' }),
    );
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
});

export const SlidesFailed = meta.story({
  args: { artifact: slides(slidesParts.failed, null) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(
        'スライドを読み取れませんでした: スライドが1枚もありません',
      ),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
});
