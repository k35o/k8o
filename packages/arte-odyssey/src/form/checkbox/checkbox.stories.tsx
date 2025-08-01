import { Checkbox } from './checkbox';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

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
        value={value}
        onChange={(e) => {
          setValue(e.target.checked);
        }}
      />
    );
  },
};
