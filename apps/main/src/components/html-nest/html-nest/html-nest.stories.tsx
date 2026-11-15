import { ListIcon } from '@k8ordo/ui/icons';
import { expect, waitFor, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import {
  mountStoryUrl,
  paramInUrl,
} from '../../../../.storybook/url-state-story';
import { HtmlNest } from './html-nest';

const meta = preview.meta({
  title: 'app/html-nest/html-nest',
  beforeEach: mountStoryUrl,
  component: HtmlNest,
  args: { pickerIcon: <ListIcon size="sm" /> },
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

export const OpenWithUrlValue = meta.story({
  parameters: { query: 'el=ul' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('<ul>')).toBeInTheDocument();
    await expect(canvas.getByText('順序なしリスト。')).toBeInTheDocument();
  },
});

export const PushOnSelectAndTraverse = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const start = navigation.currentEntry?.index ?? 0;

    await userEvent.click(canvas.getByRole('button', { name: /^svg。/u }));
    await expect(paramInUrl('el')).toBe('svg');
    await expect(navigation.currentEntry?.index).toBe(start + 1);

    await navigation.back().finished;
    await expect(paramInUrl('el')).toBeNull();
    await waitFor(async () => {
      await expect(canvas.getByText('<div>')).toBeInTheDocument();
    });

    await navigation.forward().finished;
    await expect(paramInUrl('el')).toBe('svg');
    await waitFor(async () => {
      await expect(canvas.getByText('<svg>')).toBeInTheDocument();
    });
  },
});

export const SelectSameElementDoesNotPush = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const start = navigation.currentEntry?.index ?? 0;

    await userEvent.click(canvas.getByRole('button', { name: '要素を変える' }));
    await userEvent.click(
      await within(document.body).findByRole('button', { name: /^div。/u }),
    );

    await expect(paramInUrl('el')).toBeNull();
    await expect(navigation.currentEntry?.index).toBe(start);
  },
});

export const SelectDefaultFromBrokenUrl = meta.story({
  parameters: { query: 'el=zzz', vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const start = navigation.currentEntry?.index ?? 0;
    await expect(canvas.getByText('<div>')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '要素を変える' }));
    await userEvent.click(
      await within(document.body).findByRole('button', { name: /^div。/u }),
    );

    await expect(paramInUrl('el')).toBeNull();
    await expect(navigation.currentEntry?.index).toBe(start + 1);
  },
});
