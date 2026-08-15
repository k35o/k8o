import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { TextIndentKeywordsDemo } from './text-indent-keywords-demo';

const playgroundTitle = TextIndentKeywordsDemo.name;

const meta = preview.meta({
  title: 'playgrounds/text-indent-keywords/TextIndentKeywordsDemo',
  component: TextIndentKeywordsDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
