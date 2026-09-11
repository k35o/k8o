import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { MutedAttributeDemo } from './muted-attribute-demo';

const playgroundTitle = MutedAttributeDemo.name;

const meta = preview.meta({
  title: 'playgrounds/media-pseudos/MutedAttributeDemo',
  component: MutedAttributeDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
