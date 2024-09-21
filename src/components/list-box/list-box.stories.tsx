import type { Meta, StoryObj } from '@storybook/react';
import { ListBox } from './list-box';

const meta: Meta<typeof ListBox.Root> = {
  title: 'components/list-box',
  component: ListBox.Root,
};

export default meta;
type Story = StoryObj<typeof ListBox.Root>;

export const Default: Story = {
  render: () => (
    <ListBox.Root>
      <ListBox.Trigger text="Options" />
      <ListBox.Content>
        <ListBox.Item label="Item 1" onClick={() => console.log(1)} />
        <ListBox.Item label="Item 2" onClick={() => console.log(2)} />
        <ListBox.Item label="Item 3" onClick={() => console.log(3)} />
      </ListBox.Content>
    </ListBox.Root>
  ),
};
