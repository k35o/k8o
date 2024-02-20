import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CreatingColumn } from '../../_types/column';
import { CreateColumn } from './create-column';

const meta: Meta<typeof CreateColumn> = {
  title: 'app/sql-statement/create-column',
  component: CreateColumn,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreateColumn>;

export const Default: Story = {
  render: () => {
    const [column, setColumn] = useState<CreatingColumn>({
      id: crypto.randomUUID(),
      name: '',
      alias: '',
      type: 'uuid',
      nullable: false,
    });
    return <CreateColumn column={column} setColumn={setColumn} />;
  },
};
