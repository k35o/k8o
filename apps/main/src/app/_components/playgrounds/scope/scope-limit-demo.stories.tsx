import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { ScopeLimitDemo } from './scope-limit-demo';

const playgroundTitle = ScopeLimitDemo.name;

const meta = preview.meta({
  title: 'playgrounds/scope/ScopeLimitDemo',
  component: ScopeLimitDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
