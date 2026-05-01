import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Playground } from '../playground';
import { TextIndentKeywordsDemo } from './text-indent-keywords-demo';

const playgroundTitle = TextIndentKeywordsDemo.name;

const meta: Meta<typeof TextIndentKeywordsDemo> = {
  title: 'playgrounds/text-indent-keywords/TextIndentKeywordsDemo',
  component: TextIndentKeywordsDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TextIndentKeywordsDemo>;

export const Default: Story = {};
