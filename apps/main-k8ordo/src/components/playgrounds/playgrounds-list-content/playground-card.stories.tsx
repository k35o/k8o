import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { PlaygroundCard } from './playground-card';

const meta = preview.meta({
  title: 'app/playgrounds/playgrounds-list-content/playground-card',
  component: PlaygroundCard,
});

export const WithBlog = meta.story({
  args: {
    playground: {
      id: 'popover',
      title: 'Popover API',
      description:
        'JavaScript なしでツールチップやドロップダウンメニューを実装できる API です。',
      category: 'html',
      demoCount: 2,
      demoTexts: [],
      hasBlog: true,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link')).toHaveAttribute(
      'href',
      '/playgrounds/popover',
    );
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Popover API' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('デモ2件')).toBeInTheDocument();
    await expect(canvas.getByText('ブログ記事')).toBeInTheDocument();
  },
});

export const WithoutBlog = meta.story({
  args: {
    playground: {
      id: 'view-transitions',
      title: 'View Transition API',
      description: 'DOM の更新にアニメーションを適用する API です。',
      category: 'js-api',
      demoCount: 1,
      demoTexts: [],
      hasBlog: false,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('デモ1件')).toBeInTheDocument();
    await expect(canvas.queryByText('ブログ記事')).not.toBeInTheDocument();
  },
});
