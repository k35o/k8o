import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { ClipboardTextDemo } from './clipboard-text-demo';

const meta: Meta<typeof ClipboardTextDemo> = {
  title: 'playgrounds/async-clipboard/ClipboardTextDemo',
  component: ClipboardTextDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ClipboardTextDemo>;

export const Default: Story = {};
