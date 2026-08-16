import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ContrastColorDemo } from './contrast-color-demo';

const playgroundTitle = ContrastColorDemo.name;

const meta = preview.meta({
  title: 'playgrounds/contrast-color/ContrastColorDemo',
  component: ContrastColorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
