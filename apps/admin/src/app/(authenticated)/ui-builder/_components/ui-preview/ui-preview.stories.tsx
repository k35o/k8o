import type { Spec } from '@json-render/core';
import type { ArteSpec } from '@k8o/arte-odyssey/json-render';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { UiPreview } from './ui-preview';

const meta: Meta<typeof UiPreview> = {
  title: 'admin/ui-builder/ui-preview',
  component: UiPreview,
};

export default meta;
type Story = StoryObj<typeof UiPreview>;

// 静的な spec（バインディング無し）。型付き ArteSpec で書ける。
const loginSpec = {
  root: 'root',
  elements: {
    root: {
      type: 'Stack',
      props: { direction: 'column', gap: 'md' },
      children: ['title', 'email', 'password', 'submit'],
    },
    title: { type: 'Heading', props: { text: 'ログイン', level: 'h2' } },
    email: {
      type: 'TextField',
      props: { name: 'email', placeholder: 'メールアドレス' },
    },
    password: {
      type: 'PasswordInput',
      props: { name: 'password', placeholder: 'パスワード' },
    },
    submit: {
      type: 'Button',
      props: { label: 'ログイン', color: 'primary', fullWidth: true },
    },
  },
} satisfies ArteSpec;

export const Primary: Story = {
  args: {
    spec: loginSpec,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toContain('ログイン');
  },
};

export const Empty: Story = {
  args: {
    spec: null,
  },
};

// state バインディング・repeat を含む spec（LLM が実際に生成する形）。
// props に { $item } / { $bindState } のような式オブジェクトが入るため ArteSpec の
// 静的型には収まらないが、Renderer が実行時に解決して描画できることを確認する。
const dashboardSpec: Spec = {
  root: 'dashboard',
  elements: {
    dashboard: {
      type: 'Stack',
      props: { direction: 'column', gap: 'lg' },
      children: ['heading', 'grid'],
    },
    heading: {
      type: 'Heading',
      props: { text: 'ダッシュボード', level: 'h2' },
    },
    grid: {
      type: 'Grid',
      props: { cols: 2, gap: 'md' },
      repeat: { statePath: '/stats', key: 'id' },
      children: ['card'],
    },
    card: {
      type: 'Card',
      props: { appearance: 'shadow', width: 'full' },
      children: ['cardBody'],
    },
    cardBody: {
      type: 'Stack',
      props: { direction: 'column', gap: 'sm' },
      children: ['label', 'value'],
    },
    label: {
      type: 'Heading',
      props: { text: { $item: 'label' }, level: 'h3' },
    },
    value: {
      type: 'Heading',
      props: { text: { $item: 'value' }, level: 'h3' },
    },
  },
  state: {
    stats: [
      { id: 'revenue', label: '売上', value: '¥12,480,000' },
      { id: 'users', label: 'ユーザー数', value: '48,250' },
      { id: 'conversion', label: 'コンバージョン率', value: '3.8%' },
      { id: 'bounce', label: '離脱率', value: '42.1%' },
    ],
  },
};

export const DashboardWithBindings: Story = {
  args: {
    spec: dashboardSpec,
  },
  play: async ({ canvasElement }) => {
    // repeat が state 配列を展開し、{ $item } バインディングが値に解決される
    await expect(canvasElement.textContent).toContain('売上');
    await expect(canvasElement.textContent).toContain('¥12,480,000');
    await expect(canvasElement.textContent).toContain('離脱率');
  },
};
