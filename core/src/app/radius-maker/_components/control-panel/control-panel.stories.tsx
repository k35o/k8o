import { ControlPanel } from './control-panel';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof ControlPanel> = {
  title: 'app/radius-maker/control-panel',
  component: ControlPanel,
};

export default meta;
type Story = StoryObj<typeof ControlPanel>;

export const Primary: Story = {};
