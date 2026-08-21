import type { ArteSpec } from '@k8o/arte-odyssey/json-render';
import { expect, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { SpecPreview } from './spec-preview';

// arte-odyssey catalog の代表的な部品で組んだサンプル spec（型付きで typo を防ぐ）。
const SAMPLE_SPEC = {
  root: 'page',
  elements: {
    page: {
      type: 'Stack',
      props: { direction: 'column', gap: 'lg' },
      children: ['title', 'card'],
    },
    title: { type: 'Heading', props: { level: 'h2', label: 'お問い合わせ' } },
    card: {
      type: 'Card',
      props: { variant: 'shadow' },
      children: ['form'],
    },
    form: {
      type: 'Stack',
      props: { direction: 'column', gap: 'md', padding: 'lg' },
      children: ['name', 'submit'],
    },
    name: {
      type: 'FormControl',
      props: { label: 'お名前', name: 'name', required: true },
    },
    submit: {
      type: 'Button',
      props: { label: '送信する', color: 'primary', variant: 'solid' },
    },
  },
} satisfies ArteSpec;

const meta = preview.meta({
  component: SpecPreview,
});

export const Default = meta.story({
  args: {
    spec: SAMPLE_SPEC,
    loading: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'お問い合わせ' }),
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText(/お名前/u)).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '送信する' }),
    ).toBeInTheDocument();
  },
});

export const Loading = meta.story({
  args: {
    spec: null,
    loading: true,
  },
});
