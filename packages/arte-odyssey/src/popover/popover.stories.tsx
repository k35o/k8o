import { Popover } from './popover';
import { Button } from '../button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof Popover.Root> = {
  title: 'components/popover',
  component: Popover.Root,
  parameters: {
    a11y: {
      options: {
        rules: {
          // https://github.com/floating-ui/floating-ui/pull/2298#issuecomment-1518101512
          'aria-hidden-focus': { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover.Root>;

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger
        renderItem={(props) => (
          <Button {...props} type="button" size="md">
            Popover
          </Button>
        )}
      />
      <Popover.Content
        renderItem={(props) => (
          <div
            className="bg-bg-mute rounded-sm p-4 shadow-md"
            {...props}
          >
            <div role="menuitem">Popover content</div>
          </div>
        )}
      />
    </Popover.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Popover',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
