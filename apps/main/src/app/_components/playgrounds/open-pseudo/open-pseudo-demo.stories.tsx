import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { OpenPseudoDemo } from './open-pseudo-demo';

const playgroundTitle = OpenPseudoDemo.name;

const meta = preview.meta({
  title: 'playgrounds/open-pseudo/OpenPseudoDemo',
  component: OpenPseudoDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
