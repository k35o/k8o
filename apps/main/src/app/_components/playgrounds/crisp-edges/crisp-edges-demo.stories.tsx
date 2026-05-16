import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { CrispEdgesDemo } from './crisp-edges-demo';

const playgroundTitle = CrispEdgesDemo.name;

const meta: Meta<typeof CrispEdgesDemo> = {
  title: 'playgrounds/crisp-edges/CrispEdgesDemo',
  component: CrispEdgesDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CrispEdgesDemo>;

export const Default: Story = {};
