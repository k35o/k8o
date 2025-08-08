import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip.Root> = {
  title: 'components/tooltip',
  component: Tooltip.Root,
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
type Story = StoryObj<typeof Tooltip.Root>;

export const Default: Story = {
  render: () => (
    <Tooltip.Root placement="bottom-start">
      <Tooltip.Trigger
        renderItem={(props) => (
          <Button type="button" {...props}>
            Tooltip
          </Button>
        )}
      />
      <Tooltip.Content>
        <p>Tooltip content</p>
      </Tooltip.Content>
    </Tooltip.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', {
      name: 'Tooltip',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
