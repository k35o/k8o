import type { FC, ReactNode } from 'react';
import { expect, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { AppCard } from './app-card';

const meta = preview.meta({
  title: 'app/globals/app-card',
  // linkのRoute unionはmeta.storyの型計算で "union type too complex" になるため、
  // stringに広げた型で渡す
  component: AppCard as FC<{
    link: string;
    title: string;
    description: string;
    icon?: ReactNode | undefined;
  }>,
});

export const Primary = meta.story({
  args: {
    link: '/moji-count',
    title: 'もじカウント',
    description:
      'テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。',
  },
});

export const External = meta.story({
  args: {
    link: 'https://arte-odyssey.k8o.me',
    title: 'ArteOdyssey',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを確認できます。',
  },
});

export const DisplaysTitle = meta.story({
  args: {
    link: '/moji-count',
    title: 'テストアプリ',
    description: 'テスト用の説明文です。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'テストアプリ' }),
    ).toBeInTheDocument();
  },
});

export const DisplaysDescription = meta.story({
  args: {
    link: '/radius-maker',
    title: 'アプリ名',
    description: 'これはアプリの説明文です。複数行になる場合もあります。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        'これはアプリの説明文です。複数行になる場合もあります。',
      ),
    ).toBeInTheDocument();
  },
});

export const HasLink = meta.story({
  args: {
    link: '/color-converter',
    title: 'カラーコンバーター',
    description: '色を変換します。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/color-converter');
  },
});
