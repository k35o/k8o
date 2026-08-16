import preview from '../../../../../.storybook/preview';
import { TagContent } from './tag-content';

const meta = preview.meta({
  title: 'app/tags/tag-content',
  component: TagContent,
});

export const Primary = meta.story({
  args: {
    name: 'k8o',
    blogs: [
      {
        id: 1,
        slug: 'k8o',
        title: 'k8o',
      },
    ],
    talks: [
      {
        id: 1,
        title: 'k8o',
      },
    ],
  },
});
