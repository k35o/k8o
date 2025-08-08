import { uuidV4 } from '@k8o/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import type { Column } from '../../_types/column';
import { CreateColumns } from './create-columns';

const meta: Meta<typeof CreateColumns> = {
  title: 'app/sql-table-builder/columns-info',
  component: CreateColumns,
};

export default meta;
type Story = StoryObj<typeof CreateColumns>;

export const Primary: Story = {
  render: () => {
    const [columns, setColumns] = useState<Record<string, Column>>({
      [uuidV4()]: {
        name: '',
        alias: '',
        type: 'uuid',
        nullable: false,
      },
    });
    return (
      <CreateColumns
        columns={columns}
        columnsError={undefined}
        setColumns={setColumns}
        setRestrictions={() => {
          console.log();
        }}
      />
    );
  },
};
