import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ScopeProximityDemo } from './scope-proximity-demo';

const playgroundTitle = ScopeProximityDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scope/ScopeProximityDemo',
  component: ScopeProximityDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
