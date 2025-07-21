import { HighlightBasicDemo } from './highlight-basic-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
