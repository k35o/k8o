import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { HtmlNest } from './html-nest';

const meta: Meta<typeof HtmlNest> = {
  title: 'app/html-nest/html-nest',
  component: HtmlNest,
};

export default meta;
type Story = StoryObj<typeof HtmlNest>;

export const Default: Story = {};

export const ShowsContainment: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 選択中(div)の説明と「子要素にできるもの」タブが出ている。
    await expect(canvas.getByText('選択中の要素')).toBeInTheDocument();
    await expect(
      canvas.getByRole('tab', { name: /子要素にできるもの/u }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('汎用のブロックレベルコンテナ。'),
    ).toBeInTheDocument();
  },
};

export const NavigateByChip: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // div の子要素 svg をクリックして中心を切り替える（svg はクイック選択に無く一意）。
    await userEvent.click(canvas.getByRole('button', { name: /^svg。/u }));

    // 中央が svg に切り替わり、説明が更新される。
    await expect(
      canvas.getByText('SVGベクターグラフィックの埋め込み要素。'),
    ).toBeInTheDocument();
  },
};
