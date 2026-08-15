import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { DetailsAnimationDemo } from './details-animation-demo';

const playgroundTitle = DetailsAnimationDemo.name;

const meta = preview.meta({
  title: 'playgrounds/details-content/DetailsAnimationDemo',
  component: DetailsAnimationDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
