import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { FontFamilyMathDemo } from './font-family-math-demo';

const playgroundTitle = FontFamilyMathDemo.name;

const meta: Meta<typeof FontFamilyMathDemo> = {
  title: 'playgrounds/font-family-math/FontFamilyMathDemo',
  component: FontFamilyMathDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FontFamilyMathDemo>;

export const Default: Story = {};
