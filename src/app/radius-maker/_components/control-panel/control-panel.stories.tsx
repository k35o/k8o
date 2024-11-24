import type { Meta, StoryObj } from '@storybook/react';
import { ControlPanel } from './control-panel';

const meta: Meta<typeof ControlPanel> = {
  title: 'app/radius-maker/control-panel',
  component: ControlPanel,
};

export default meta;
type Story = StoryObj<typeof ControlPanel>;

export const Primary: Story = {};
