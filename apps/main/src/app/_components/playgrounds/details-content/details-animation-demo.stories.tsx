import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { DetailsAnimationDemo } from './details-animation-demo';

const playgroundTitle = DetailsAnimationDemo.name;

const meta: Meta<typeof DetailsAnimationDemo> = {
  title: 'playgrounds/details-content/DetailsAnimationDemo',
  component: DetailsAnimationDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DetailsAnimationDemo>;

export const Default: Story = {};
