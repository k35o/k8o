import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { OpenPseudoDemo } from './open-pseudo-demo';

const playgroundTitle = OpenPseudoDemo.name;

const meta: Meta<typeof OpenPseudoDemo> = {
  title: 'playgrounds/open-pseudo/OpenPseudoDemo',
  component: OpenPseudoDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OpenPseudoDemo>;

export const Default: Story = {};
