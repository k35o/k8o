import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from './dropdown-menu';
import { MoonStar } from 'lucide-react';

const meta: Meta<typeof DropdownMenu.Root> = {
  title: 'components/dropdown-menu',
  component: DropdownMenu.Root,
};

export default meta;
type Story = StoryObj<typeof DropdownMenu.Root>;

export const Default: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger text="Options" />
      <DropdownMenu.Content>
        <DropdownMenu.ItemList>
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
        </DropdownMenu.ItemList>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};

export const TriggerByIcon: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.IconTrigger
        icon={<MoonStar className="size-8" />}
        label="Options"
      />
      <DropdownMenu.Content>
        <DropdownMenu.ItemList>
          <DropdownMenu.Item>Item 1</DropdownMenu.Item>
          <DropdownMenu.Item>Item 2</DropdownMenu.Item>
          <DropdownMenu.Item>Item 3</DropdownMenu.Item>
        </DropdownMenu.ItemList>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};
