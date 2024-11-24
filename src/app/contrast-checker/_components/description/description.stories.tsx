import type { Meta, StoryObj } from '@storybook/react';
import { Description } from './description';

const meta: Meta<typeof Description> = {
  title: 'app/colors/contrasts/description',
  component: Description,
};

export default meta;
type Story = StoryObj<typeof Description>;

export const Default: Story = {};
