import type { Meta, StoryObj } from '@storybook/react';
import { CreateColumns } from './create-columns';
import { useState } from 'react';
import { CreatingColumn } from '../../_types/column';

const meta: Meta<typeof CreateColumns> = {
  title: 'app/sql-statement/columns-info',
  component: CreateColumns,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreateColumns>;

export const Primary: Story = {
  render: () => {
    const [columns, setColumns] = useState<CreatingColumn[]>([
      {
        id: crypto.randomUUID(),
        name: '',
        alias: '',
        type: 'uuid',
        nullable: false,
      },
    ]);
    return (
      <CreateColumns columns={columns} setColumns={setColumns} />
    );
  },
};
