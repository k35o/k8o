import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { DetailsContentDemo } from './details-content-demo';

const meta: Meta<typeof DetailsContentDemo> = {
  title: 'playgrounds/details-content/DetailsContentDemo',
  component: DetailsContentDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DetailsContentDemo>;

export const Default: Story = {};
