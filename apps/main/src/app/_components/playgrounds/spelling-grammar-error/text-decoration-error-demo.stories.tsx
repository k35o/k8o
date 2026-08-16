import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { TextDecorationErrorDemo } from './text-decoration-error-demo';

const playgroundTitle = TextDecorationErrorDemo.name;

const meta = preview.meta({
  title: 'playgrounds/spelling-grammar-error/TextDecorationErrorDemo',
  component: TextDecorationErrorDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
