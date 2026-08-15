import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ContainerStyleQueriesDemo } from './container-style-queries-demo';

const playgroundTitle = ContainerStyleQueriesDemo.name;

const meta = preview.meta({
  title: 'playgrounds/container-style-queries/ContainerStyleQueriesDemo',
  component: ContainerStyleQueriesDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
