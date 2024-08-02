import type { Meta, StoryObj } from '@storybook/react';
import { CreateRestrictions } from './create-restrictions';
import { useState } from 'react';
import { Restriction } from '../../_types/restriction';
import { Column } from '../../_types/column';
import { uuidV4 } from '@/utils/uuid-v4';

const meta: Meta<typeof CreateRestrictions> = {
  title: 'app/sql-statement/create-restrictions',
  component: CreateRestrictions,
  tags: ['autodocs'],
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
