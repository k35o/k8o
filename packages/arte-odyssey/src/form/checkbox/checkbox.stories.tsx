import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'components/form/checkbox',
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(false);

    return (
      <Checkbox
        label="checkbox"
        onChange={(e) => {
          setValue(e.target.checked);
        }}
        value={value}
      />
    );
  },
};
