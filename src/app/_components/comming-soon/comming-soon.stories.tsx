import { CommingSoon } from './comming-soon';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CommingSoon> = {
  title: 'app/globals/comming-soon',
  component: CommingSoon,
};

export default meta;
type Story = StoryObj<typeof CommingSoon>;

export const Primary: Story = {};
