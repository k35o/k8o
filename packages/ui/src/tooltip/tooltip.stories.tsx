import { Tooltip } from './tooltip';
import { Button } from '../button';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Tooltip.Root> = {
  title: 'components/tooltip',
  component: Tooltip.Root,
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
};
