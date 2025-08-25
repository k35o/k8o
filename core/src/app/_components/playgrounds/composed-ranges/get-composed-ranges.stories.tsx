import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { GetComposedRanges } from './get-composed-ranges';

const meta: Meta<typeof GetComposedRanges> = {
  title: 'playgrounds/composed-ranges/GetComposedRanges',
  component: GetComposedRanges,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GetComposedRanges>;

export const Default: Story = {};
