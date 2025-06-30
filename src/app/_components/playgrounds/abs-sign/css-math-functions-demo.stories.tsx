import { CssMathFunctionsDemo } from './css-math-functions-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof CssMathFunctionsDemo> = {
  title: 'playgrounds/abs-sign/CssMathFunctionsDemo',
  component: CssMathFunctionsDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CssMathFunctionsDemo>;

export const Default: Story = {};
