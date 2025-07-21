import { CreateRestrictions } from './create-restrictions';
import { Column } from '../../_types/column';
import { Restriction } from '../../_types/restriction';
import { uuidV4 } from '@k8o/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

const meta: Meta<typeof CreateRestrictions> = {
  title: 'app/sql-table-builder/create-restrictions',
  component: CreateRestrictions,
};

export default meta;
type Story = StoryObj<typeof CreateRestrictions>;

const uuids: [string, string, string] = [
  uuidV4(),
  uuidV4(),
  uuidV4(),
];

export const Primary: Story = {
  render: () => {
    const columns: Record<string, Column> = {
      [uuids[0]]: {
        name: 'id',
        alias: 'name',
        type: 'serial',
        nullable: false,
      },
      [uuids[1]]: {
        name: 'name',
        alias: '名前',
        type: 'text',
        nullable: false,
      },
      [uuids[2]]: {
        name: 'address',
        alias: '住所',
        type: 'text',
        nullable: true,
      },
    };
    const [restrictions, setRestrictions] = useState<
      Record<string, Restriction>
    >({
      [uuids[0]]: {
        type: 'primary',
        columns: [],
      },
      [uuids[1]]: {
        type: 'unique',
        columns: [],
      },
      [uuids[2]]: {
        type: 'foreign',
        column: uuids[0],
        reference: {
          table: '',
          column: '',
        },
      },
    });

    return (
      <CreateRestrictions
        columns={columns}
        restrictions={restrictions}
        setRestrictions={setRestrictions}
        restroctionsError={undefined}
      />
    );
  },
};
