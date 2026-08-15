import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SelectionMethods } from './selection-methods';

const playgroundTitle = SelectionMethods.name;

const meta = preview.meta({
  title: 'playgrounds/composed-ranges/SelectionMethods',
  component: SelectionMethods,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
