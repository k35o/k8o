import { ClipboardImageDemo } from './clipboard-image-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof ClipboardImageDemo> = {
  title: 'playgrounds/async-clipboard/ClipboardImageDemo',
  component: ClipboardImageDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ClipboardImageDemo>;

export const Default: Story = {};
