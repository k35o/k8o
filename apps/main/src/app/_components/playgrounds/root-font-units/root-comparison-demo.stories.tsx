import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { RootComparisonDemo } from './root-comparison-demo';

const playgroundTitle = RootComparisonDemo.name;

const meta = preview.meta({
  title: 'playgrounds/root-font-units/RootComparisonDemo',
  component: RootComparisonDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
