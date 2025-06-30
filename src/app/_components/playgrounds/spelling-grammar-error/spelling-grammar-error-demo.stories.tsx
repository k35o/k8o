import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof SpellingGrammarErrorDemo> = {
  title:
    'playgrounds/spelling-grammar-error/SpellingGrammarErrorDemo',
  component: SpellingGrammarErrorDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SpellingGrammarErrorDemo>;

export const Default: Story = {};
