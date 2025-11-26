import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import type { Table } from '../../_types/table';
import { CreateTable } from './create-table';

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
      <CreateTable setTable={setTable} table={table} tableError={undefined} />
    );
  },
};
