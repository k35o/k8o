import { ViewIcon } from '@k8o/arte-odyssey';
import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { StatCard } from './stat-card';

const meta = preview.meta({
  title: 'admin/stat-card',
  component: StatCard,
});

export const Primary = meta.story({
  args: {
    label: '総閲覧数',
    value: '12,345',
  },
});

export const WithDescription = meta.story({
  args: {
    label: '総閲覧数',
    value: '12,345',
    description: '先月比 +10%',
  },
});

export const WithIcon = meta.story({
  args: {
    label: '総閲覧数',
    value: '12,345',
    icon: <ViewIcon size="md" />,
  },
});

export const DisplaysLabel = meta.story({
  args: {
    label: 'コメント数',
    value: '42',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('コメント数')).toBeInTheDocument();
    await expect(canvas.getByText('42')).toBeInTheDocument();
  },
});
