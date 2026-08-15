import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { HtmlNest } from './html-nest';

const meta = preview.meta({
  title: 'app/html-nest/html-nest',
  component: HtmlNest,
});

export const Default = meta.story();

export const ShowsContainment = meta.story({
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
});

export const NavigateByChip = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // div の子要素 svg をクリックして中心を切り替える（svg はクイック選択に無く一意）。
    await userEvent.click(canvas.getByRole('button', { name: /^svg。/u }));

    // 中央が svg に切り替わり、説明が更新される。
    await expect(
      canvas.getByText('SVGベクターグラフィックの埋め込み要素。'),
    ).toBeInTheDocument();
  },
});
