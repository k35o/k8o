import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Playground } from '../playground';
import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';

const playgroundTitle = SpellingGrammarErrorDemo.name;

const meta: Meta<typeof SpellingGrammarErrorDemo> = {
  title: 'playgrounds/spelling-grammar-error/SpellingGrammarErrorDemo',
  component: SpellingGrammarErrorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SpellingGrammarErrorDemo>;

export const Default: Story = {};
