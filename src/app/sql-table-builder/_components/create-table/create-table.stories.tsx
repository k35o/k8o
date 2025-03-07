import { CreateTable } from './create-table';
import { Table } from '../../_types/table';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta<typeof CreateTable> = {
  title: 'app/sql-table-builder/create-table',
};

export default meta;
type Story = StoryObj<typeof CreateTable>;

export const Primary: Story = {
  render: () => {
    const [table, setTable] = useState<Table>({
      name: '',
      alias: '',
    });
    return (
      <CreateTable
        table={table}
        setTable={setTable}
        tableError={undefined}
      />
    );
  },
};
