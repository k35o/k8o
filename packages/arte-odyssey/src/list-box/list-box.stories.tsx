import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Option } from './hooks';
import { ListBox } from './list-box';

const meta: Meta<typeof ListBox.Root> = {
  title: 'components/list-box',
  component: ListBox.Root,
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
          onSelect={(key: string) => {
            setSelected(key);
          }}
          options={OPTIONS}
          value={selected}
        >
          <ListBox.Trigger />
          <ListBox.Content />
        </ListBox.Root>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', {
      name: '選択してください',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
  },
};
