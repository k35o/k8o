import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';
import { Playground } from '../playground';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof SpellingGrammarErrorDemo> = {
  title:
    'playgrounds/spelling-grammar-error/SpellingGrammarErrorDemo',
  component: SpellingGrammarErrorDemo,
  decorators: [
    (Story) => (
      <Playground>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SpellingGrammarErrorDemo>;

export const Default: Story = {};
