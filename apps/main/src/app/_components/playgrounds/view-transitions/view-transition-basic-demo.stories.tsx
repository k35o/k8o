import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ViewTransitionBasicDemo } from './view-transition-basic-demo';

const playgroundTitle = ViewTransitionBasicDemo.name;

const meta = preview.meta({
  title: 'playgrounds/view-transitions/ViewTransitionBasicDemo',
  component: ViewTransitionBasicDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
