import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { CssMathFunctionsDemo } from './css-math-functions-demo';

const meta: Meta<typeof CssMathFunctionsDemo> = {
  title: 'playgrounds/abs-sign/CssMathFunctionsDemo',
  component: CssMathFunctionsDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CssMathFunctionsDemo>;

export const Default: Story = {};
