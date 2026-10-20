import type { Spec } from '@json-render/core';
import { getRouter, redirect } from '@storybook/nextjs-vite/navigation.mock';
import { useState } from 'react';
import type { ComponentProps, FC } from 'react';
import {
  expect,
  fn,
  mocked,
  screen,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import type { ArtifactForRoute } from '@/features/artifacts/interface/queries';

import preview from '../../../../../../.storybook/preview';
import { ToolFrame } from '../../../_components/tool-frame';
import type { ArtifactForkAction } from '../artifact-fork-button';
import type { ArtifactShareActions } from '../artifact-share-menu';
import { ArtifactDetail } from './artifact-detail';

import styles from './artifact-detail.stories.module.css';

const THREAD_ID = '6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01';

const PRICING: Spec = {
  root: 'page',
  elements: {
    page: {
      type: 'Stack',
      props: { direction: 'column', gap: 'md' },
      children: ['title', 'more', 'form'],
    },
    title: { type: 'Heading', props: { level: 'h2', label: '料金プラン' } },
    more: { type: 'Anchor', props: { label: '詳しく見る', href: '/chat' } },
    form: { type: 'Form', props: { action: '/chat' }, children: ['keyword'] },
    keyword: {
      type: 'FormControl',
      props: { label: 'キーワード', name: 'keyword' },
    },
  },
};

const UI_ARTIFACT: ArtifactForRoute = {
  id: 'a1b2c3d4e5f6',
  kind: 'ui',
  versions: [
    {
      version: 3,
      title: '料金表',
      instruction: '年払いの列を足して',
      summary: '年払いの価格を並べました。',
      threadId: null,
      createdAt: '2026-10-15T03:00:00.000Z',
      origin: { type: 'edit', version: 2 },
    },
    {
      version: 2,
      title: '料金表',
      instruction: 'おすすめのプランを目立たせて',
      summary: 'おすすめのプランに印を付けました。',
      threadId: THREAD_ID,
      createdAt: '2026-10-14T03:00:00.000Z',
      origin: { type: 'edit', version: 1 },
    },
    {
      version: 1,
      title: '料金の表',
      instruction: '3つのプランを比べる料金表',
      summary: '3列の料金表を作りました。',
      threadId: THREAD_ID,
      createdAt: '2026-10-13T03:00:00.000Z',
      origin: { type: 'new' },
    },
  ],
  selected: { version: 2, kind: 'ui', title: '料金表', spec: PRICING },
  share: null,
};

const DECK = [
  '<Cover>',
  '# TypeScript 入門',
  '## 型の基礎',
  '</Cover>',
  '',
  '---',
  '',
  '## 型注釈',
  '',
  '```ts',
  'const answer: number = 42;',
  '```',
].join('\n');

const SLIDES_ARTIFACT: ArtifactForRoute = {
  id: 's1t2u3v4w5x6',
  kind: 'slides',
  versions: [
    {
      version: 1,
      title: 'TypeScript 入門',
      instruction: '型の基礎を2枚で',
      summary: '型の基礎を2枚にまとめました。',
      threadId: THREAD_ID,
      createdAt: '2026-10-13T03:00:00.000Z',
      origin: { type: 'new' },
    },
  ],
  selected: {
    version: 1,
    kind: 'slides',
    title: 'TypeScript 入門',
    source: DECK,
  },
  share: null,
};

// Storybook の型は navigation に segments を持たないが、実行時は segments からルーターの木を組み、
// ToolFrame の useSelectedLayoutSegment がそれを読む。型の注釈を付けない定数にして渡す
const artifactNavigation = {
  pathname: '/artifacts/a1b2c3d4e5f6',
  segments: ['artifacts', 'a1b2c3d4e5f6'],
};

// Storybook の Link は移動しないので、押した履歴の行の ?v= を読んで、選んでいる版を差し替える。
// 中身はどの版も同じにし、入力が消えたのが中身の違いのせいにならないようにする
const VersionSwitch: FC<ComponentProps<typeof ArtifactDetail>> = ({
  artifact,
  highlight,
  shareActions,
  forkAction,
}) => {
  const [version, setVersion] = useState(artifact.selected.version);
  return (
    <div
      className={styles.versionSwitch}
      onClickCapture={(event) => {
        const link =
          event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>('a[href*="?v="]')
            : null;
        if (link !== null) {
          setVersion(Number(new URL(link.href).searchParams.get('v')));
        }
      }}
    >
      <ArtifactDetail
        artifact={{ ...artifact, selected: { ...artifact.selected, version } }}
        forkAction={forkAction}
        highlight={highlight}
        shareActions={shareActions}
      />
    </div>
  );
};

const headerIn = (canvasElement: HTMLElement): HTMLElement => {
  const header = canvasElement.querySelector('header');
  if (header === null) {
    throw new Error('ヘッダーがありません');
  }
  return header;
};

// xl 未満のタブと xl 以上の見出しに同じ名前のボタンがあるので、見えているほうを押す
const visibleButton = (
  canvasElement: HTMLElement,
  name: string,
): HTMLElement => {
  const button = within(canvasElement)
    .getAllByRole('button', { name, hidden: true })
    .find((element) => element.checkVisibility());
  if (button === undefined) {
    throw new Error(`見えている「${name}」のボタンがありません`);
  }
  return button;
};

// 「新しいチャットで直す」のリンクが入力欄に入れる書き出し
const draftOf = (canvasElement: HTMLElement): string | null => {
  const href = within(canvasElement)
    .getByRole('link', { name: '新しいチャットで直す' })
    .getAttribute('href');
  if (href === null) {
    return null;
  }
  const url = new URL(href, canvasElement.ownerDocument.location.origin);
  return url.pathname === '/chat' ? url.searchParams.get('draft') : null;
};

// 文書全体に効く印刷の規則（@page）を持つ <style> の media
const printRuleMedia = (): string[] =>
  [...document.querySelectorAll('style')]
    .filter((style) =>
      [...(style.sheet?.cssRules ?? [])].some(
        (rule) => rule instanceof CSSPageRule,
      ),
    )
    .map((style) => style.media);

const meta = preview.meta({
  component: ArtifactDetail,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <ToolFrame sidebar={null}>
          <Story />
        </ToolFrame>
      </div>
    ),
  ],
  parameters: {
    nextjs: { navigation: artifactNavigation },
  },
  args: {
    artifact: UI_ARTIFACT,
    highlight: null,
    shareActions: {
      publish: fn<ArtifactShareActions['publish']>(),
      changeVersion: fn<ArtifactShareActions['changeVersion']>(),
      unpublish: fn<ArtifactShareActions['unpublish']>(),
    },
    forkAction: fn<ArtifactForkAction>(),
  } satisfies Partial<ComponentProps<typeof ArtifactDetail>>,
});

export const Ui = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = within(headerIn(canvasElement));
    // 見出しは選んでいる版のタイトル
    await expect(
      header.getByRole('heading', { level: 1, name: '料金表' }),
    ).toBeInTheDocument();
    await expect(header.getByText('UI')).toBeInTheDocument();
    await expect(header.getByText('版 2')).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: '料金プラン' }),
    ).toBeVisible();
    // プレビューのあいだは、コピーするコードを出さない
    await expect(
      canvas.queryByRole('button', { name: 'コードをコピー' }),
    ).not.toBeInTheDocument();
    // 見出しのビューの切り替えは xl 以上にだけ出し、テストのビューポートでは隠れている
    await expect(
      header.getByRole('button', { name: 'TSX', hidden: true }),
    ).not.toBeVisible();
    // 新しいチャットの入力欄に、選んでいる版を土台にする書き出しを入れる
    await expect(draftOf(canvasElement)).toBe(
      'UI「料金表」（artifactId: a1b2c3d4e5f6）の版 2 を土台に、',
    );
    // UI は PDF に出さない
    await expect(
      header.queryByRole('button', { name: 'PDF出力' }),
    ).not.toBeInTheDocument();
    await expect(
      header.getByRole('button', { name: '共有（非公開）' }),
    ).toBeVisible();
    await expect(canvas.queryByText('公開中')).not.toBeInTheDocument();
  },
});

export const Fork = meta.story({
  play: async ({ args, canvasElement }) => {
    mocked(args.forkAction).mockImplementation(() =>
      Promise.resolve().then(() => redirect('/artifacts/f6e5d4c3b2a1')),
    );
    // 狭い幅でも、選んでいる版をフォークできる
    await userEvent.click(
      within(headerIn(canvasElement)).getByRole('button', {
        name: '版 2 をフォーク',
      }),
    );
    await expect(args.forkAction).toHaveBeenCalledOnce();
    await expect(args.forkAction).toHaveBeenCalledWith('a1b2c3d4e5f6', 2);
    await waitFor(() =>
      expect(getRouter().push).toHaveBeenCalledWith(
        '/artifacts/f6e5d4c3b2a1',
        {},
      ),
    );
    await expect(
      screen.queryByText('フォークできませんでした'),
    ).not.toBeInTheDocument();
  },
});

export const Published = meta.story({
  args: {
    artifact: {
      ...UI_ARTIFACT,
      share: { slug: 'AAAAAAAAAAAAAAAA', version: 3 },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 選んでいる版と別の版を公開していても、見出しの操作と履歴の印は公開している版を指す
    await expect(
      within(headerIn(canvasElement)).getByRole('button', {
        name: '共有（版 3 を公開中）',
      }),
    ).toBeVisible();
    await expect(
      within(
        canvas.getByRole('link', { name: /^版 3(?!を)/u, hidden: true }),
      ).getByText('公開中'),
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
      await userEvent.type(canvas.getByLabelText('キーワード'), 'UI{Enter}');
    } finally {
      document.removeEventListener('click', record);
      document.removeEventListener('submit', record);
    }
    // 生成物の中のリンクとフォームでは、画面ごと移らない
    await expect(prevented).toStrictEqual(['click', 'submit']);
    await expect(document.location.href).toBe(before);
  },
});

export const TabsOnNarrow = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = (name: string): HTMLElement =>
      visibleButton(canvasElement, name);

    await userEvent.type(canvas.getByLabelText('キーワード'), '料金');
    await userEvent.click(tabs('履歴'));
    await expect(tabs('履歴')).toHaveAttribute('aria-pressed', 'true');
    await expect(
      canvas.getByRole('region', { name: '版の履歴' }),
    ).toBeVisible();
    // 履歴を出しているあいだも、生成 UI はアンマウントせずに隠す
    await expect(
      canvas.getByRole('heading', { name: '料金プラン', hidden: true }),
    ).not.toBeVisible();

    await userEvent.click(tabs('TSX'));
    await expect(
      canvas.getByText(/export default function Preview\(\)/u),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'コードをコピー' }),
    ).toBeEnabled();
    await expect(
      canvas.getByRole('region', { name: '版の履歴', hidden: true }),
    ).not.toBeVisible();

    await userEvent.click(tabs('プレビュー'));
    await expect(canvas.getByLabelText('キーワード')).toHaveValue('料金');
  },
});

export const SwitchesVersion = meta.story({
  render: (args) => <VersionSwitch {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('キーワード'), '料金');
    await userEvent.click(visibleButton(canvasElement, '履歴'));
    await userEvent.click(canvas.getByRole('link', { name: /^版 3(?!を)/u }));
    await expect(
      within(headerIn(canvasElement)).getByText('版 3'),
    ).toBeInTheDocument();
    // 版を移っても、出していたタブはそのまま
    await expect(visibleButton(canvasElement, '履歴')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // 前の版の生成 UI に入れた値は持ち越さない
    await userEvent.click(visibleButton(canvasElement, 'プレビュー'));
    await expect(canvas.getByLabelText('キーワード')).toHaveValue('');
  },
});

export const KeepsViewAcrossVersions = meta.story({
  render: (args) => <VersionSwitch {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = within(headerIn(canvasElement));
    await userEvent.click(visibleButton(canvasElement, 'TSX'));
    await userEvent.click(visibleButton(canvasElement, '履歴'));
    await userEvent.click(canvas.getByRole('link', { name: /^版 3(?!を)/u }));
    await expect(header.getByText('版 3')).toBeInTheDocument();
    await expect(visibleButton(canvasElement, '履歴')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // 選んでいるビューも残る。見出しのビューの切り替えはテストのビューポートでは隠れている
    await expect(
      header.getByRole('button', { name: 'TSX', hidden: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
});

export const Slides = meta.story({
  args: { artifact: SLIDES_ARTIFACT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = within(headerIn(canvasElement));
    await expect(
      header.getByRole('heading', { level: 1, name: 'TypeScript 入門' }),
    ).toBeInTheDocument();
    await expect(header.getByText('スライド')).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 2, name: '型の基礎' }),
    ).toBeVisible();
    // スライドのコードのビューは Markdown だけ
    await expect(
      canvas.queryByRole('button', { name: 'TSX', hidden: true }),
    ).not.toBeInTheDocument();
    await userEvent.click(visibleButton(canvasElement, 'Markdown'));
    await expect(canvas.getByText(/## 型注釈/u)).toBeVisible();
    await expect(draftOf(canvasElement)).toBe(
      'スライド「TypeScript 入門」（artifactId: s1t2u3v4w5x6）の版 1 を土台に、',
    );
  },
});

export const PrintSlides = meta.story({
  args: { artifact: SLIDES_ARTIFACT },
  beforeEach: () => {
    spyOn(window, 'print').mockImplementation(() => {});
  },
  play: async ({ canvasElement }) => {
    const printedSlides = (): number | undefined =>
      document.body.querySelector('[data-slide-print]')?.children.length;
    // 選んでいる版の全スライドを、印刷用に描いておく
    await expect(printedSlides()).toBe(2);
    await expect(printRuleMedia()).toEqual(['print']);
    await userEvent.click(
      within(headerIn(canvasElement)).getByRole('button', {
        name: 'PDF出力',
      }),
    );
    await expect(window.print).toHaveBeenCalledOnce();

    // 履歴や Markdown を出しているあいだも、本文は隠すだけなので印刷できる
    await userEvent.click(visibleButton(canvasElement, '履歴'));
    await expect(printedSlides()).toBe(2);
    await expect(printRuleMedia()).toEqual(['print']);
    await userEvent.click(visibleButton(canvasElement, 'Markdown'));
    await expect(printedSlides()).toBe(2);
    await expect(printRuleMedia()).toEqual(['print']);
  },
});
