import type { Spec } from '@json-render/core';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { ArtifactPane } from './artifact-pane';
import type { ArtifactView } from './artifact-views';

import styles from './artifact-pane.stories.module.css';

const CONTACT: Spec = {
  root: 'page',
  elements: {
    page: {
      type: 'Stack',
      props: { direction: 'column', gap: 'md' },
      children: ['title', 'more', 'form'],
    },
    title: { type: 'Heading', props: { level: 'h2', label: 'お問い合わせ' } },
    more: { type: 'Anchor', props: { label: '詳しく見る', href: '/chat' } },
    form: { type: 'Form', props: { action: '/chat' }, children: ['keyword'] },
    keyword: {
      type: 'FormControl',
      props: { label: 'キーワード', name: 'keyword' },
    },
  },
};

const meta = preview.meta({
  component: ArtifactPane,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  // propより狭い型（unionリテラル）のままargsを推論させると meta.storyの型推論が壊れるため、
  // satisfiesで文脈型を与えて広げる
  args: {
    artifact: {
      toolCallId: 'ui-done',
      title: 'お問い合わせフォーム',
      spec: CONTACT,
      text: 'キーワードで探せるフォームを置きました。',
      open: 'preview',
      state: 'done',
      version: 2,
    },
    view: 'preview',
    onViewChange: fn<(view: ArtifactView) => void>(),
    onClose: fn<() => void>(),
    highlight: null,
  } satisfies Partial<ComponentProps<typeof ArtifactPane>>,
});

export const Done = meta.story({
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const pane = canvas.getByRole('region', { name: 'UI のプレビュー' });
    await expect(
      within(pane).getByRole('heading', { name: 'お問い合わせフォーム' }),
    ).toBeInTheDocument();
    await expect(within(pane).getByText('版 2')).toBeInTheDocument();
    await expect(
      within(pane).getByRole('heading', { name: 'お問い合わせ' }),
    ).toBeInTheDocument();
    // プレビューのあいだは、コピーするコードを出さない
    await expect(
      canvas.queryByRole('button', { name: 'コードをコピー' }),
    ).not.toBeInTheDocument();
    // ビューの切り替えと閉じるボタンは xl 以上にだけ出し、テストのビューポートでは隠れている
    const tsx = canvas.getByRole('button', { name: 'TSX', hidden: true });
    await expect(tsx).not.toBeVisible();
    await userEvent.click(tsx);
    await expect(args.onViewChange).toHaveBeenCalledWith('tsx');
    const close = canvas.getByRole('button', {
      name: 'プレビューを閉じる',
      hidden: true,
    });
    await expect(close).not.toBeVisible();
    await userEvent.click(close);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
});

export const SpecCode = meta.story({
  args: { view: 'spec' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/"root": "page"/u)).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'コードをコピー' }),
    ).toBeEnabled();
    // コードを見ているあいだも、生成 UI はアンマウントせずに隠す
    await expect(
      canvas.getByRole('heading', { name: 'お問い合わせ', hidden: true }),
    ).not.toBeVisible();
  },
});

export const TsxCode = meta.story({
  args: { view: 'tsx' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/export default function Preview\(\)/u),
    ).toBeVisible();
    await expect(canvas.getByText(/from '@k8ordo\/ui'/u)).toBeVisible();
  },
});

export const CodeBeforeSpec = meta.story({
  args: {
    view: 'spec',
    artifact: {
      toolCallId: 'ui-thinking',
      title: 'お問い合わせフォーム',
      spec: null,
      text: '考えています…',
      open: 'preview',
      state: 'generating',
      editingVersion: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 見出しの状態と、コードの欄の待ちの文。隠れたプレビューの待ちの表示は数えない
    await expect(
      canvas
        .getAllByText('考えています…')
        .filter((element) => element.checkVisibility()),
    ).toHaveLength(2);
    await expect(
      canvas.getByRole('button', { name: 'コードをコピー' }),
    ).toBeDisabled();
  },
});

export const WaitingCodeOnNarrow = meta.story({
  decorators: [
    (Story) => (
      <div className={styles.narrow}>
        <Story />
      </div>
    ),
  ],
  args: {
    view: 'spec',
    artifact: {
      toolCallId: 'ui-waiting',
      title: 'お問い合わせフォーム',
      spec: CONTACT,
      text: '生成を続けています。終わると最新に置き換わります',
      open: 'preview',
      state: 'generating',
      editingVersion: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pane = canvas
      .getByRole('region', { name: 'UI のプレビュー' })
      .getBoundingClientRect();
    // 長い状態の文は見出しの中で縮み、タイトルを潰さず、コピーのボタンをペインの外へ押し出さない
    await expect(
      canvas
        .getByRole('heading', { name: 'お問い合わせフォーム' })
        .getBoundingClientRect().width,
    ).toBeGreaterThan(48);
    await expect(
      canvas
        .getByRole('button', { name: 'コードをコピー' })
        .getBoundingClientRect().right,
    ).toBeLessThanOrEqual(pane.right);
  },
});

export const Thinking = meta.story({
  args: {
    artifact: {
      toolCallId: 'ui-thinking',
      title: 'お問い合わせフォーム',
      spec: null,
      text: '考えています…',
      open: 'preview',
      state: 'generating',
      editingVersion: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // spec が届くまでは、プレビューの枠に待ちの表示を重ねる。隠れたコードの欄の待ちの文は数えない
    await expect(
      canvas
        .getAllByText('考えています…')
        .filter((element) => element.checkVisibility()),
    ).toHaveLength(2);
    await expect(canvas.queryByText(/版 /u)).not.toBeInTheDocument();
  },
});

export const Drawing = meta.story({
  args: {
    artifact: {
      toolCallId: 'ui-drawing',
      title: 'お問い合わせフォーム',
      spec: {
        root: 'page',
        elements: {
          page: {
            type: 'Stack',
            props: { direction: 'column', gap: 'md' },
            children: ['title', 'more'],
          },
          title: {
            type: 'Heading',
            props: { level: 'h2', label: 'お問い合わせ' },
          },
        },
      },
      text: '描いています…',
      open: 'preview',
      state: 'generating',
      editingVersion: 1,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // まだ届いていない子は飛ばして、書きかけの spec を描く
    await expect(
      canvas.getByRole('heading', { name: 'お問い合わせ' }),
    ).toBeInTheDocument();
    await expect(
      canvas
        .getAllByText('描いています…')
        .filter((element) => element.checkVisibility()),
    ).toHaveLength(1);
  },
});

export const Stopped = meta.story({
  args: {
    artifact: {
      toolCallId: 'ui-stopped',
      title: 'お問い合わせフォーム',
      spec: CONTACT,
      text: '途中で止まりました',
      open: 'partial',
      state: 'stopped',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      '保存していない、途中までの UI です。続けるときはもう一度頼んでください',
    );
    await expect(
      canvas.getByRole('heading', { name: 'お問い合わせ' }),
    ).toBeInTheDocument();
  },
});

export const LinksAndForms = meta.story({
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
    document.addEventListener('click', record);
    document.addEventListener('submit', record);
    try {
      await userEvent.click(canvas.getByRole('link', { name: '詳しく見る' }));
      // 1行の入力欄で Enter を押すと、送るボタンが無くてもフォームが送られる
      await userEvent.type(canvas.getByLabelText('キーワード'), 'UI{Enter}');
    } finally {
      document.removeEventListener('click', record);
      document.removeEventListener('submit', record);
    }
    await expect(prevented).toStrictEqual(['click', 'submit']);
    await expect(document.location.href).toBe(before);
  },
});
