import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { AlphaValueDemo } from './alpha-value-demo';

const playgroundTitle = AlphaValueDemo.name;

const meta = preview.meta({
  title: 'playgrounds/alpha-function/AlphaValueDemo',
  component: AlphaValueDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
