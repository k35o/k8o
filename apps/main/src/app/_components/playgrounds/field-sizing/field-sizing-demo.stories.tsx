import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { FieldSizingDemo } from './field-sizing-demo';

const playgroundTitle = FieldSizingDemo.name;

const meta = preview.meta({
  title: 'playgrounds/field-sizing/FieldSizingDemo',
  component: FieldSizingDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
