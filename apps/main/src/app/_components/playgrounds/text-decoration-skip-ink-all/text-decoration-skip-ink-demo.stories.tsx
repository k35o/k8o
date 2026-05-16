import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { TextDecorationSkipInkDemo } from './text-decoration-skip-ink-demo';

const playgroundTitle = TextDecorationSkipInkDemo.name;

const meta: Meta<typeof TextDecorationSkipInkDemo> = {
  title: 'playgrounds/text-decoration-skip-ink-all/TextDecorationSkipInkDemo',
  component: TextDecorationSkipInkDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TextDecorationSkipInkDemo>;

export const Default: Story = {};
