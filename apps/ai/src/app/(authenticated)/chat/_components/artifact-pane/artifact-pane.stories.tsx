import type { Spec } from '@json-render/core';
import { useState } from 'react';
import type { ComponentProps, FC } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import type { ArtifactView } from '../../../_components/artifact-body';
import { ArtifactPane } from './artifact-pane';

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

const DONE = {
  kind: 'ui',
  toolCallId: 'ui-done',
  title: 'お問い合わせフォーム',
  spec: CONTACT,
  text: 'キーワードで探せるフォームを置きました。',
  open: 'preview',
  state: 'done',
  artifactId: 'a1b2c3d4e5f6',
  version: 2,
} as const;

const VERSIONS = [
  { toolCallId: 'ui-v1', version: 1 },
  { toolCallId: 'ui-v2', version: 2 },
  { toolCallId: 'ui-v3', version: 3 },
];

// ChatScreen と同じく、選んだ版をペインに出す。版ごとに中身を変えると、本体を作り直さなくても入力欄やスライドの位置が戻って見えるので、同じ中身にする
const VersionSwitcher: FC<ComponentProps<typeof ArtifactPane>> = (props) => {
  const [shown, setShown] = useState(props.artifact.toolCallId);
  return (
    <ArtifactPane
      {...props}
      artifact={{
        ...props.artifact,
        ...props.versions.find((version) => version.toolCallId === shown),
      }}
      onSelectVersion={setShown}
    />
  );
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
    artifact: DONE,
    versions: [],
    onSelectVersion: fn<(toolCallId: string) => void>(),
    view: 'preview',
    onViewChange: fn<(view: ArtifactView) => void>(),
    expanded: false,
    onExpandedChange: fn<(expanded: boolean) => void>(),
    onClose: fn<() => void>(),
    highlight: null,
  } satisfies Partial<ComponentProps<typeof ArtifactPane>>,
});

export const Done = meta.story({
  args: { versions: [{ toolCallId: 'ui-done', version: 2 }] },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const pane = canvas.getByRole('region', { name: 'UI のプレビュー' });
    await expect(
      within(pane).getByRole('heading', { name: 'お問い合わせフォーム' }),
    ).toBeInTheDocument();
    await expect(within(pane).getByText('版 2')).toBeInTheDocument();
    // できた版は、生成物のページでその版を開ける。xl 未満でも隠さない
    const open = within(pane).getByRole('link', {
      name: '作ったもののページを開く',
    });
    await expect(open).toHaveAttribute('href', '/artifacts/a1b2c3d4e5f6?v=2');
    await expect(open).toBeVisible();
    // 版が1つなら、選ぶ口を出さずにバッジで示す
    await expect(
      within(pane).queryByRole('combobox', { name: /表示する版/u }),
    ).not.toBeInTheDocument();
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
    const expand = canvas.getByRole('button', {
      name: '全画面で見る',
      hidden: true,
    });
    await expect(expand).not.toBeVisible();
    await expect(expand).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(expand);
    await expect(args.onExpandedChange).toHaveBeenCalledWith(true);
    const close = canvas.getByRole('button', {
      name: 'プレビューを閉じる',
      hidden: true,
    });
    await expect(close).not.toBeVisible();
    await userEvent.click(close);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
});

export const Expanded = meta.story({
  args: { expanded: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const expand = canvas.getByRole('button', {
      name: '全画面で見る',
      hidden: true,
    });
    // 広げても名前は変えず、押した状態で伝える
    await expect(expand).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(expand);
    await expect(args.onExpandedChange).toHaveBeenCalledWith(false);
  },
});

export const SwitchesVersion = meta.story({
  args: { artifact: { ...DONE, toolCallId: 'ui-v2' }, versions: VERSIONS },
  render: (args) => <VersionSwitcher {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('キーワード'), '料金');
    await expect(canvas.getByLabelText('キーワード')).toHaveValue('料金');
    await userEvent.click(
      canvas.getByRole('combobox', { name: '表示する版 版 2' }),
    );
    await userEvent.click(canvas.getByRole('option', { name: '版 3' }));
    // 見出しは作り直さないので、選んだあともトリガーにフォーカスが戻る
    await expect(
      canvas.getByRole('combobox', { name: '表示する版 版 3' }),
    ).toHaveFocus();
    // 別の版へ移ると、本体を作り直して生成 UI の入力を持ち越さない
    await expect(canvas.getByLabelText('キーワード')).toHaveValue('');
    await expect(
      canvas
        .getAllByText('版 3')
        .filter((element) => element.checkVisibility()),
    ).toHaveLength(1);
  },
});

export const ReselectsCurrentVersion = meta.story({
  args: { artifact: { ...DONE, toolCallId: 'ui-v2' }, versions: VERSIONS },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('combobox', { name: '表示する版 版 2' }),
    );
    await userEvent.click(canvas.getByRole('option', { name: '版 2' }));
    // 今出している版を選び直しても、選んだことにしない
    await expect(args.onSelectVersion).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('combobox', { name: '表示する版 版 2' }),
    );
    await userEvent.click(canvas.getByRole('option', { name: '版 3' }));
    await expect(args.onSelectVersion).toHaveBeenCalledOnce();
    await expect(args.onSelectVersion).toHaveBeenCalledWith('ui-v3');
  },
});

export const VersionsOnNarrow = meta.story({
  decorators: [
    (Story) => (
      <div className={styles.narrow}>
        <Story />
      </div>
    ),
  ],
  args: {
    view: 'spec',
    artifact: { ...DONE, toolCallId: 'ui-v2' },
    versions: VERSIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pane = canvas
      .getByRole('region', { name: 'UI のプレビュー' })
      .getBoundingClientRect();
    // 版の選ぶ口があっても、タイトルを潰さず、コピーのボタンをペインの外へ押し出さない
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
      kind: 'ui',
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
      kind: 'ui',
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
      kind: 'ui',
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
    // 版になっていないものは、生成物のページで開けない
    await expect(
      canvas.queryByRole('link', { name: '作ったもののページを開く' }),
    ).not.toBeInTheDocument();
  },
});

export const Drawing = meta.story({
  args: {
    artifact: {
      kind: 'ui',
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
      kind: 'ui',
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
    await expect(
      canvas.queryByRole('link', { name: '作ったもののページを開く' }),
    ).not.toBeInTheDocument();
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

const SLIDES_DECK = [
  '<Cover>',
  '# TypeScript 入門',
  '## 型の基礎',
  '</Cover>',
  '',
  '---',
  '',
  '## 型とは',
  '',
  '- 値の形を[ハンドブック](https://www.typescriptlang.org/docs/)で確かめる',
  '',
  '<Notes>',
  '最初に型の目的を話す。',
  '</Notes>',
  '',
  '---',
  '',
  '## 型注釈',
  '',
  '```ts',
  'const answer: number = 42;',
  '```',
].join('\n');

const SLIDES_DONE = {
  kind: 'slides',
  toolCallId: 'slides-done',
  title: '入門の発表',
  source: SLIDES_DECK,
  text: '型の基礎を3枚にまとめました。',
  open: 'preview',
  state: 'done',
  artifactId: 's1t2u3v4w5x6',
  version: 1,
} as const;

const SLIDES_VERSIONS = [
  { toolCallId: 'slides-v1', version: 1 },
  { toolCallId: 'slides-v2', version: 2 },
];

export const SlidesDone = meta.story({
  args: { artifact: SLIDES_DONE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pane = canvas.getByRole('region', { name: 'スライドのプレビュー' });
    await expect(
      within(pane).getByRole('heading', { level: 2, name: '入門の発表' }),
    ).toBeInTheDocument();
    await expect(within(pane).getByText('版 1')).toBeInTheDocument();
    await expect(
      within(pane).getByRole('link', { name: '作ったもののページを開く' }),
    ).toHaveAttribute('href', '/artifacts/s1t2u3v4w5x6?v=1');
    await expect(
      within(pane).getByRole('heading', { level: 1, name: 'TypeScript 入門' }),
    ).toBeInTheDocument();
    await expect(within(pane).getByText('/ 3')).toBeInTheDocument();
    // スライドのコードのビューは Markdown だけで、UI の spec と TSX は出さない
    await expect(
      within(pane).getByRole('button', { name: 'Markdown', hidden: true }),
    ).toBeInTheDocument();
    await expect(
      within(pane).queryByRole('button', { name: 'TSX', hidden: true }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(pane).getByRole('button', { name: '次のスライド' }),
    );
    await expect(
      await within(pane).findByRole('heading', { level: 2, name: '型とは' }),
    ).toBeInTheDocument();
    await expect(
      within(pane).getByText(/最初に型の目的を話す。/u),
    ).toBeInTheDocument();
    // UI と同じ枠に、デッキの送りの操作まで収まる
    await expect(
      within(pane)
        .getByRole('button', { name: '次のスライド' })
        .getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(pane.getBoundingClientRect().bottom);
    // 会話の画面には、印刷用のスライドを描かない
    await expect(document.body.querySelector('[data-slide-print]')).toBeNull();
  },
});

export const SlidesMarkdown = meta.story({
  args: { artifact: SLIDES_DONE, view: 'markdown' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/## 型注釈/u)).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'コードをコピー' }),
    ).toBeEnabled();
    // Markdown を見ているあいだも、デッキはアンマウントせずに隠す
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'TypeScript 入門',
        hidden: true,
      }),
    ).not.toBeVisible();
  },
});

export const SlidesThinking = meta.story({
  args: {
    artifact: {
      kind: 'slides',
      toolCallId: 'slides-thinking',
      title: '入門の発表',
      source: null,
      text: '考えています…',
      open: 'preview',
      state: 'generating',
      editingVersion: 1,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // デッキが届くまでは待ちの表示にし、DeckPreview の空の文を出さない
    await expect(
      canvas
        .getAllByText('考えています…')
        .filter((element) => element.checkVisibility()),
    ).toHaveLength(2);
    await expect(
      canvas.queryByRole('button', { name: '次のスライド' }),
    ).not.toBeInTheDocument();
  },
});

export const SlidesWriting = meta.story({
  args: {
    artifact: {
      kind: 'slides',
      toolCallId: 'slides-writing',
      title: '入門の発表',
      source: SLIDES_DECK,
      text: 'スライドを書いています…',
      open: 'preview',
      state: 'generating',
      editingVersion: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 書いているあいだは、書き込まれている最後のスライドを出し、送らせない
    await expect(
      canvas.getByRole('heading', { level: 2, name: '型注釈' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '前のスライド' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: '次のスライド' }),
    ).toBeDisabled();
  },
});

export const SlidesStopped = meta.story({
  args: {
    artifact: {
      kind: 'slides',
      toolCallId: 'slides-stopped',
      title: '入門の発表',
      source: SLIDES_DECK,
      text: '途中で止まりました',
      open: 'partial',
      state: 'stopped',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      '保存していない、途中までのスライドです。続けるときはもう一度頼んでください',
    );
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'TypeScript 入門' }),
    ).toBeInTheDocument();
  },
});

export const SlidesSwitchesVersion = meta.story({
  args: {
    artifact: { ...SLIDES_DONE, toolCallId: 'slides-v2', version: 2 },
    versions: SLIDES_VERSIONS,
  },
  render: (args) => <VersionSwitcher {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await expect(
      await canvas.findByRole('heading', { level: 2, name: '型とは' }),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('combobox', { name: '表示する版 版 2' }),
    );
    await userEvent.click(canvas.getByRole('option', { name: '版 1' }));
    // 別の版へ移ると、デッキを作り直して表紙から出す
    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'TypeScript 入門',
      }),
    ).toBeInTheDocument();
  },
});

export const SlidesLinks = meta.story({
  args: { artifact: SLIDES_DONE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const before = document.location.href;
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    const prevented: string[] = [];
    const record = (event: Event): void => {
      if (event.defaultPrevented) {
        prevented.push(event.type);
      }
    };
    document.addEventListener('click', record);
    try {
      await userEvent.click(
        await canvas.findByRole('link', { name: 'ハンドブック' }),
      );
    } finally {
      document.removeEventListener('click', record);
    }
    await expect(prevented).toStrictEqual(['click']);
    await expect(document.location.href).toBe(before);
  },
});
