import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { HighlightSpellingDemo } from './highlight-spelling-demo';

const playgroundTitle = HighlightSpellingDemo.name;

const meta = preview.meta({
  title: 'playgrounds/highlight/HighlightSpellingDemo',
  component: HighlightSpellingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
