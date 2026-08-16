import preview from '../../../../../../.storybook/preview';
import { SourceForm } from './source-form';

const meta = preview.meta({
  title: 'admin/reading-list/source-form',
  component: SourceForm,
});

const noopAction = () => Promise.resolve({});

export const New = meta.story({
  args: {
    action: noopAction,
  },
});

export const Edit = meta.story({
  args: {
    action: noopAction,
    defaultValues: {
      title: 'Zenn',
      url: 'https://zenn.dev/feed',
      siteUrl: 'https://zenn.dev',
      type: 'feed',
    },
  },
});

export const EditManual = meta.story({
  args: {
    action: noopAction,
    defaultValues: {
      title: '手動ソース',
      url: 'https://example.com/rss',
      siteUrl: 'https://example.com',
      type: 'manual',
    },
  },
});
