import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { TokenDerivationDemo } from './token-derivation-demo';

const playgroundTitle = TokenDerivationDemo.name;

const meta = preview.meta({
  title: 'playgrounds/alpha-function/TokenDerivationDemo',
  component: TokenDerivationDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
