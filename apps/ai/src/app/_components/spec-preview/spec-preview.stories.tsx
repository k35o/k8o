import type { UISpec } from '@k8ordo/ui/json-render';
import { expect, userEvent, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { SpecPreview } from './spec-preview';

// @k8ordo/ui catalog の代表的な部品で組んだサンプル spec（型付きで typo を防ぐ）。
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
} satisfies UISpec;

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

const LINKS_AND_FORMS_SPEC = {
  root: 'page',
  elements: {
    page: {
      type: 'Stack',
      props: { direction: 'column', gap: 'md' },
      children: ['more', 'form'],
    },
    more: {
      type: 'Anchor',
      props: { label: '詳しく見る', href: 'https://example.com/?d=1' },
    },
    form: {
      type: 'Form',
      props: { action: 'https://example.com/' },
      children: ['keyword'],
    },
    keyword: {
      type: 'FormControl',
      props: { label: 'キーワード', name: 'keyword' },
    },
  },
} satisfies UISpec;

// 公開ページを含むどの面でも、生成 UI のリンクとフォームでは移動しない
export const LinksAndForms = meta.story({
  args: {
    spec: LINKS_AND_FORMS_SPEC,
    loading: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const before = document.location.href;
    const prevented: string[] = [];
    const record = (event: Event): void => {
      if (event.defaultPrevented) {
        prevented.push(event.type);
      }
    };
    for (const type of ['click', 'auxclick', 'submit']) {
      document.addEventListener(type, record);
    }
    try {
      const link = canvas.getByRole('link', { name: '詳しく見る' });
      await userEvent.click(link);
      // ブラウザで描いたあとは inert を外すので、リンクにフォーカスが移る
      await expect(link).toHaveFocus();
      // 中クリックは、新しいタブで開く既定の動きを止める
      await userEvent.pointer({ keys: '[MouseMiddle]', target: link });
      // 1行の入力欄で Enter を押すと、送るボタンが無くてもフォームが送られる
      await userEvent.type(canvas.getByLabelText('キーワード'), 'UI{Enter}');
    } finally {
      for (const type of ['click', 'auxclick', 'submit']) {
        document.removeEventListener(type, record);
      }
    }
    await expect(prevented).toStrictEqual(['click', 'auxclick', 'submit']);
    await expect(document.location.href).toBe(before);
  },
});
