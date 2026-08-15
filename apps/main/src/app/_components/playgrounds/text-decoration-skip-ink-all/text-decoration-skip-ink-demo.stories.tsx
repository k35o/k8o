import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { TextDecorationSkipInkDemo } from './text-decoration-skip-ink-demo';

const playgroundTitle = TextDecorationSkipInkDemo.name;

const meta = preview.meta({
  title: 'playgrounds/text-decoration-skip-ink-all/TextDecorationSkipInkDemo',
  component: TextDecorationSkipInkDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
