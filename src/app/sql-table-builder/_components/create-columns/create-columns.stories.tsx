import { CreateColumns } from './create-columns';
import { Column } from '../../_types/column';
import { uuidV4 } from '@/utils/uuid-v4';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

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
        setColumns={setColumns}
        setRestrictions={() => {
          console.log();
        }}
        columnsError={undefined}
      />
    );
  },
};
