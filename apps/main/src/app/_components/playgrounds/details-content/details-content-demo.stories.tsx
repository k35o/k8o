import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { DetailsContentDemo } from './details-content-demo';

const playgroundTitle = DetailsContentDemo.name;

const meta = preview.meta({
  title: 'playgrounds/details-content/DetailsContentDemo',
  component: DetailsContentDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
