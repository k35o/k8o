import type { Meta, StoryObj } from '@storybook/react';
import { ListBox } from './list-box';
import { Option } from './hooks';
import { useState } from 'react';

const meta: Meta<typeof ListBox.Root> = {
  title: 'components/list-box',
  component: ListBox.Root,
};

export default meta;
type Story = StoryObj<typeof ListBox.Root>;

const OPTIONS: Option[] = [
  { key: '1', label: 'apple' },
  { key: '2', label: 'banana' },
  { key: '3', label: 'cherry' },
  { key: '4', label: 'date' },
  { key: '5', label: 'elderberry' },
  { key: '6', label: 'fig' },
  { key: '7', label: 'grape' },
  { key: '8', label: 'honeydew' },
  { key: '9', label: 'kiwi' },
  { key: '10', label: 'lemon' },
  { key: '11', label: 'mango' },
  { key: '12', label: 'nectarine' },
  { key: '13', label: 'orange' },
  { key: '14', label: 'pear' },
  { key: '15', label: 'quince' },
  { key: '16', label: 'raspberry' },
  { key: '17', label: 'strawberry' },
  { key: '18', label: 'tangerine' },
  { key: '19', label: 'watermelon' },
];

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>();
    return (
      <div className="w-56">
        <ListBox.Root
          options={OPTIONS}
          value={selected}
          onSelect={(key: string) => setSelected(key)}
        >
          <ListBox.Trigger />
          <ListBox.Content />
        </ListBox.Root>
      </div>
    );
  },
};
