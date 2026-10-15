import type { Spec } from '@json-render/core';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { uiErrorText } from '@/features/agent/application/ui-artifacts';

import preview from '../../../../../../.storybook/preview';
import { UiArtifactCard } from './ui-artifact-card';

const PRICING: Spec = {
  root: 'title',
  elements: {
    title: { type: 'Heading', props: { level: 'h2', label: '料金プラン' } },
  },
};

const meta = preview.meta({
  component: UiArtifactCard,
  // propより狭い型（unionリテラル）のままargsを推論させると meta.storyの型推論が壊れるため、
  // satisfiesで文脈型を与えて広げる
  args: {
    artifact: {
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
  } satisfies Partial<ComponentProps<typeof UiArtifactCard>>,
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
      toolCallId: 'ui-failed-long',
      title: '料金プラン',
      spec: null,
      text: uiErrorText(UNFIXED_ERROR_TEXT),
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
