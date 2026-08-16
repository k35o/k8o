import preview from '../../../../../../.storybook/preview';
import { DeleteSourceButton } from './delete-source-button';

const meta = preview.meta({
  title: 'admin/reading-list/delete-source-button',
  component: DeleteSourceButton,
});

export const Primary = meta.story({
  args: {
    id: 1,
    title: 'web.dev',
  },
});
