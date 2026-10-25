import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { RevertRuleDemo } from './revert-rule-demo';

const playgroundTitle = RevertRuleDemo.name;

const meta = preview.meta({
  title: 'playgrounds/revert-rule/RevertRuleDemo',
  component: RevertRuleDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
