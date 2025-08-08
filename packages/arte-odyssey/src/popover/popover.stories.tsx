import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Popover } from './popover';

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
          <Button {...props} size="md" type="button">
            Popover
          </Button>
        )}
      />
      <Popover.Content
        renderItem={(props) => (
          <div className="rounded-sm bg-bg-mute p-4 shadow-md" {...props}>
            {/** biome-ignore lint/a11y/useFocusableInteractive: storyなので妥協 */}
            <div role="menuitem">Popover content</div>
          </div>
        )}
      />
    </Popover.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', {
      name: 'Popover',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
