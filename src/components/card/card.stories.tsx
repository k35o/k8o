import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './card';
import { InteractiveCard } from './interactive-card';

const meta: Meta<typeof Card> = {
  title: 'components/card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    children: 'card',
  },
};

export const Secondary: Story = {
  args: {
    children: 'card',
    variant: 'secondary',
  },
};

export const Interactive: Story = {
  args: {
    children: 'card',
  },
  render: (props) => <InteractiveCard {...props} />,
};