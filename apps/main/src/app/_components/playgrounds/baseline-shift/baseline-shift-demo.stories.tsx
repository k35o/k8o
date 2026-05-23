import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { BaselineShiftDemo } from './baseline-shift-demo';

const playgroundTitle = BaselineShiftDemo.name;

const meta: Meta<typeof BaselineShiftDemo> = {
  title: 'playgrounds/baseline-shift/BaselineShiftDemo',
  component: BaselineShiftDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof BaselineShiftDemo>;

export const Default: Story = {};
