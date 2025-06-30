import { HighlightBasicDemo } from './highlight-basic-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof HighlightBasicDemo> = {
  title: 'playgrounds/highlight/HighlightBasicDemo',
  component: HighlightBasicDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HighlightBasicDemo>;

export const Default: Story = {};
