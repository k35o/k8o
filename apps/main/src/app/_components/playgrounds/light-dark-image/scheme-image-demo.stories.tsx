import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { SchemeImageDemo } from './scheme-image-demo';

const playgroundTitle = SchemeImageDemo.name;

const meta = preview.meta({
  title: 'playgrounds/light-dark-image/SchemeImageDemo',
  component: SchemeImageDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
