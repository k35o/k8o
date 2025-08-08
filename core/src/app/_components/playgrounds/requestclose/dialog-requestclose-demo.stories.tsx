import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { DialogRequestCloseDemo } from './dialog-requestclose-demo';

const meta: Meta<typeof DialogRequestCloseDemo> = {
  title: 'playgrounds/requestclose/DialogRequestCloseDemo',
  component: DialogRequestCloseDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DialogRequestCloseDemo>;

export const Default: Story = {};
