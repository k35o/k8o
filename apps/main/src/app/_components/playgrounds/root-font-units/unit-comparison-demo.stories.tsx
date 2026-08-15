import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { UnitComparisonDemo } from './unit-comparison-demo';

const playgroundTitle = UnitComparisonDemo.name;

const meta = preview.meta({
  title: 'playgrounds/root-font-units/UnitComparisonDemo',
  component: UnitComparisonDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
