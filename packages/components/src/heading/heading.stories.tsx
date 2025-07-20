import { Heading } from './heading';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Heading> = {
  title: 'components/heading',
  component: Heading,
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const H1: Story = {
  args: {
    type: 'h1',
  },
  render: (args) => <Heading {...args}>k8o</Heading>,
};

export const H2: Story = {
  args: {
    type: 'h2',
  },
  render: (args) => <Heading {...args}>k8o</Heading>,
};

export const H3: Story = {
  args: {
    type: 'h3',
  },
  render: (args) => <Heading {...args}>k8o</Heading>,
};

export const H4: Story = {
  args: {
    type: 'h4',
  },
  render: (args) => <Heading {...args}>k8o</Heading>,
};

export const H5: Story = {
  args: {
    type: 'h5',
  },
  render: (args) => <Heading {...args}>k8o</Heading>,
};

export const H6: Story = {
  args: {
    type: 'h6',
  },
  render: (args) => <Heading {...args}>k8o</Heading>,
};
