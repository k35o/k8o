import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ScrollAnchoringDemo } from './scroll-anchoring-demo';

const playgroundTitle = ScrollAnchoringDemo.name;

const meta = preview.meta({
  title: 'playgrounds/overflow-anchor/ScrollAnchoringDemo',
  component: ScrollAnchoringDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
