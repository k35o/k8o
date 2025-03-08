import { DarkModeIcon } from '../icons';
import { DropdownMenu } from './dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react';

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
        <DropdownMenu.Item
          label="Item 1"
          onClick={() => {
            console.log(1);
          }}
        />
        <DropdownMenu.Item
          label="Item 2"
          onClick={() => {
            console.log(2);
          }}
        />
        <DropdownMenu.Item
          label="Item 3"
          onClick={() => {
            console.log(3);
          }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};

export const TriggerByIcon: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.IconTrigger
        icon={<DarkModeIcon size="lg" />}
        label="Options"
      />
      <DropdownMenu.Content>
        <DropdownMenu.Item
          label="Item 1"
          onClick={() => {
            console.log(1);
          }}
        />
        <DropdownMenu.Item
          label="Item 2"
          onClick={() => {
            console.log(2);
          }}
        />
        <DropdownMenu.Item
          label="Item 3"
          onClick={() => {
            console.log(3);
          }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};
