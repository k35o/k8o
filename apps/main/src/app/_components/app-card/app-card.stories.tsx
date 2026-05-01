import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { AppCard } from './app-card';

const meta: Meta<typeof AppCard> = {
  title: 'app/globals/app-card',
  component: AppCard,
};

export default meta;
type Story = StoryObj<typeof AppCard>;

export const Primary: Story = {
  args: {
    link: '/moji-count',
    title: 'もじカウント',
    description:
      'テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。',
  },
};

export const External: Story = {
  args: {
    link: 'https://arte-odyssey.k8o.me',
    title: 'ArteOdyssey',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを確認できます。',
  },
};

export const DisplaysTitle: Story = {
  args: {
    link: '/base-converter',
    title: 'テストアプリ',
    description: 'テスト用の説明文です。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが表示されていることを確認
    await expect(
      canvas.getByRole('heading', { name: 'テストアプリ' }),
    ).toBeInTheDocument();
  },
};

export const DisplaysDescription: Story = {
  args: {
    link: '/qr-generator',
    title: 'アプリ名',
    description: 'これはアプリの説明文です。複数行になる場合もあります。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 説明文が表示されていることを確認
    await expect(
      canvas.getByText(
        'これはアプリの説明文です。複数行になる場合もあります。',
      ),
    ).toBeInTheDocument();
  },
};

export const HasLink: Story = {
  args: {
    link: '/color-converter',
    title: 'カラーコンバーター',
    description: '色を変換します。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // リンクが正しいhrefを持っていることを確認
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/color-converter');
  },
};
