import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SourceForm } from './source-form';

const meta: Meta<typeof SourceForm> = {
  title: 'admin/reading-list/source-form',
  component: SourceForm,
};

export default meta;
type Story = StoryObj<typeof SourceForm>;

const noopAction = () => Promise.resolve({});

export const New: Story = {
  args: {
    action: noopAction,
  },
};

export const Edit: Story = {
  args: {
    action: noopAction,
    defaultValues: {
      title: 'Zenn',
      url: 'https://zenn.dev/feed',
      siteUrl: 'https://zenn.dev',
      type: 'feed',
    },
  },
};

export const EditManual: Story = {
  args: {
    action: noopAction,
    defaultValues: {
      title: '手動ソース',
      url: 'https://example.com/rss',
      siteUrl: 'https://example.com',
      type: 'manual',
    },
  },
};
