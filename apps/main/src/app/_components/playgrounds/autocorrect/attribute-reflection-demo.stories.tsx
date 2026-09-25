import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { AttributeReflectionDemo } from './attribute-reflection-demo';

const playgroundTitle = AttributeReflectionDemo.name;

const meta = preview.meta({
  title: 'playgrounds/autocorrect/AttributeReflectionDemo',
  component: AttributeReflectionDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
