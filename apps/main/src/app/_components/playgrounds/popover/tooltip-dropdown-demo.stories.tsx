import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { TooltipDropdownDemo } from './tooltip-dropdown-demo';

const playgroundTitle = TooltipDropdownDemo.name;

const meta = preview.meta({
  title: 'playgrounds/popover/TooltipDropdownDemo',
  component: TooltipDropdownDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
