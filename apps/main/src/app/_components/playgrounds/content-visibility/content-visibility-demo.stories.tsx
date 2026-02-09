import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ContentVisibilityDemo } from './content-visibility-demo';

const playgroundTitle = ContentVisibilityDemo.name;

const meta: Meta<typeof ContentVisibilityDemo> = {
  title: 'playgrounds/content-visibility/ContentVisibilityDemo',
  component: ContentVisibilityDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentVisibilityDemo>;

export const Default: Story = {};
