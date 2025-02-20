import type { Meta, StoryObj } from '@storybook/react';
import { ColorInfo } from './color-info';

const meta: Meta<typeof ColorInfo> = {
  title: 'app/design-system/color/color-info',
  component: ColorInfo,
  decorators: [
    (Story) => (
      <div className="bg-bg-base p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ColorInfo>;

export const Foreground: Story = {
  args: {
    name: 'foreground',
    code: 'gray.900',
    codeDark: 'gray.50',
    variant: 'foreground',
  },
};

export const Background: Story = {
  args: {
    name: 'background',
    code: 'white',
    codeDark: 'gray.900',
    variant: 'background',
  },
};

export const Border: Story = {
  args: {
    name: 'border',
    code: 'gray.400',
    codeDark: 'gray.600',
    variant: 'border',
  },
};
