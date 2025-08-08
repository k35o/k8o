import type { Meta, StoryObj } from '@storybook/react-vite';
import { BaselineStatus } from './baseline-status';

const meta: Meta<typeof BaselineStatus> = {
  title: 'components/baseline-status',
  component: BaselineStatus,
};

export default meta;
type Story = StoryObj<typeof BaselineStatus>;

export const Primary: Story = {
  args: {
    featureId: 'promise-try',
  },
};
