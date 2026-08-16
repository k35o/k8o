import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { GetComposedRanges } from './get-composed-ranges';

const playgroundTitle = GetComposedRanges.name;

const meta = preview.meta({
  title: 'playgrounds/composed-ranges/GetComposedRanges',
  component: GetComposedRanges,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
