import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { CssMathFunctionsDemo } from './css-math-functions-demo';

const playgroundTitle = CssMathFunctionsDemo.name;

const meta = preview.meta({
  title: 'playgrounds/abs-sign/CssMathFunctionsDemo',
  component: CssMathFunctionsDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
