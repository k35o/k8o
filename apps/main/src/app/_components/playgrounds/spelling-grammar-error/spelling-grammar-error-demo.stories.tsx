import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SpellingGrammarErrorDemo } from './spelling-grammar-error-demo';

const playgroundTitle = SpellingGrammarErrorDemo.name;

const meta = preview.meta({
  title: 'playgrounds/spelling-grammar-error/SpellingGrammarErrorDemo',
  component: SpellingGrammarErrorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
