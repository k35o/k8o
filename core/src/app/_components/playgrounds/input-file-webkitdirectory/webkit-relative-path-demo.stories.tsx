import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { WebkitRelativePathDemo } from './webkit-relative-path-demo';

const meta = {
  title: 'playgrounds/input-file-webkitdirectory/WebkitRelativePathDemo',
  component: WebkitRelativePathDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
} satisfies Meta<typeof WebkitRelativePathDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
