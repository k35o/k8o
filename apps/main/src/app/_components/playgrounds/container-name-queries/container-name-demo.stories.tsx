import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ContainerNameDemo } from './container-name-demo';

const playgroundTitle = ContainerNameDemo.name;

const meta = preview.meta({
  title: 'playgrounds/container-name-queries/ContainerNameDemo',
  component: ContainerNameDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
