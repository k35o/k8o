import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { DonutScopeDemo } from './donut-scope-demo';

const playgroundTitle = DonutScopeDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scope/DonutScopeDemo',
  component: DonutScopeDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
