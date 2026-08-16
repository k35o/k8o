import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { AdminSidebar } from './admin-sidebar';

const meta = preview.meta({
  title: 'admin/admin-sidebar',
  component: AdminSidebar,
});

export const Primary = meta.story();

export const HighlightsActiveRoute = meta.story({
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/comments',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getAllByText('お問い合わせ')[0]?.closest('a') ?? null;
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
});
