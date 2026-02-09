import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { CssMathFunctionsDemo } from './css-math-functions-demo';

const playgroundTitle = CssMathFunctionsDemo.name;

const meta: Meta<typeof CssMathFunctionsDemo> = {
  title: 'playgrounds/abs-sign/CssMathFunctionsDemo',
  component: CssMathFunctionsDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CssMathFunctionsDemo>;

export const Default: Story = {};
