import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { DialogRequestCloseDemo } from './dialog-requestclose-demo';

const playgroundTitle = DialogRequestCloseDemo.name;

const meta: Meta<typeof DialogRequestCloseDemo> = {
  title: 'playgrounds/requestclose/DialogRequestCloseDemo',
  component: DialogRequestCloseDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DialogRequestCloseDemo>;

export const Default: Story = {};
