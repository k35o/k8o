import { Popover } from './popover';
import { Button } from '../button';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof Popover.Root> = {
  title: 'components/popover',
  component: Popover.Root,
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
          <section
            className="bg-bg-mute rounded-sm p-4 shadow-md"
            {...props}
          >
            <p>Popover content</p>
          </section>
        )}
      />
    </Popover.Root>
  ),
};
