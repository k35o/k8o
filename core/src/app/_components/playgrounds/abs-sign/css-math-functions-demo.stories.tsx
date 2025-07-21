import { CssMathFunctionsDemo } from './css-math-functions-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
