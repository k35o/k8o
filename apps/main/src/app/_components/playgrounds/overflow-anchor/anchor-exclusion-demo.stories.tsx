import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { AnchorExclusionDemo } from './anchor-exclusion-demo';

const playgroundTitle = AnchorExclusionDemo.name;

const meta = preview.meta({
  title: 'playgrounds/overflow-anchor/AnchorExclusionDemo',
  component: AnchorExclusionDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
