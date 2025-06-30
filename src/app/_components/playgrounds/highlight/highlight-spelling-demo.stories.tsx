import { HighlightSpellingDemo } from './highlight-spelling-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof HighlightSpellingDemo> = {
  title: 'playgrounds/highlight/HighlightSpellingDemo',
  component: HighlightSpellingDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HighlightSpellingDemo>;

export const Default: Story = {};
