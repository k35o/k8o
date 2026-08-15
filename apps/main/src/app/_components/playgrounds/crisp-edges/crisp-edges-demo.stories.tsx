import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { CrispEdgesDemo } from './crisp-edges-demo';

const playgroundTitle = CrispEdgesDemo.name;

const meta = preview.meta({
  title: 'playgrounds/crisp-edges/CrispEdgesDemo',
  component: CrispEdgesDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
