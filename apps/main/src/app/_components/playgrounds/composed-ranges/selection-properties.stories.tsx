import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SelectionProperties } from './selection-properties';

const playgroundTitle = SelectionProperties.name;

const meta = preview.meta({
  title: 'playgrounds/composed-ranges/SelectionProperties',
  component: SelectionProperties,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
