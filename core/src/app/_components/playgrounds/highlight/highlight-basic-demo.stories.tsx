import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { HighlightBasicDemo } from './highlight-basic-demo';

const meta: Meta<typeof HighlightBasicDemo> = {
  title: 'playgrounds/highlight/HighlightBasicDemo',
  component: HighlightBasicDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HighlightBasicDemo>;

export const Default: Story = {};
