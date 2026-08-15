import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { HighlightBasicDemo } from './highlight-basic-demo';

const playgroundTitle = HighlightBasicDemo.name;

const meta = preview.meta({
  title: 'playgrounds/highlight/HighlightBasicDemo',
  component: HighlightBasicDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
