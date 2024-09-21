import type { Meta, StoryObj } from '@storybook/react';
import { ListBox } from './list-box';

const meta: Meta<typeof ListBox.Root> = {
  title: 'components/list-box',
  component: ListBox.Root,
};

export default meta;
type Story = StoryObj<typeof ListBox.Root>;

const OPTIONS = [
  'apple',
  'banana',
  'cherry',
  'date',
  'elderberry',
  'fig',
  'grape',
  'honeydew',
  'kiwi',
  'lemon',
  'mango',
  'nectarine',
];

export const Default: Story = {
  render: () => (
    <ListBox.Root options={OPTIONS}>
      <ListBox.Trigger />
      <ListBox.Content />
    </ListBox.Root>
  ),
};
