import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { HighlightSpellingDemo } from './highlight-spelling-demo';

const playgroundTitle = HighlightSpellingDemo.name;

const meta: Meta<typeof HighlightSpellingDemo> = {
  title: 'playgrounds/highlight/HighlightSpellingDemo',
  component: HighlightSpellingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HighlightSpellingDemo>;

export const Default: Story = {};
