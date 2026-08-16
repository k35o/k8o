import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ActiveViewTransitionDemo } from './active-view-transition-demo';

const playgroundTitle = ActiveViewTransitionDemo.name;

const meta = preview.meta({
  title: 'playgrounds/active-view-transition/ActiveViewTransitionDemo',
  component: ActiveViewTransitionDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
