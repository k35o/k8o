import type { Meta, StoryObj } from '@storybook/react';
import { CreateRestriction } from './create-restriction';
import { useState } from 'react';
import { Restriction } from '../../_types/restriction';
import { Column } from '../../_types/column';

const meta: Meta<typeof CreateRestriction> = {
  title: 'app/sql-statement/create-restriction',
  component: CreateRestriction,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreateRestriction>;

const uuids: [string, string, string] = [
  crypto.randomUUID(),
  crypto.randomUUID(),
  crypto.randomUUID(),
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
    const [restriction, setRestriction] = useState<Restriction>({
      type: 'primary',
      columns: [],
    });

    return (
      <CreateRestriction
        columns={columns}
        restriction={restriction}
        setRestriction={setRestriction}
        restrictionError={undefined}
      />
    );
  },
};

export const Unique: Story = {
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
    const [restriction, setRestriction] = useState<Restriction>({
      type: 'unique',
      columns: [],
    });

    return (
      <CreateRestriction
        columns={columns}
        restriction={restriction}
        setRestriction={setRestriction}
        restrictionError={undefined}
      />
    );
  },
};

export const Foreign: Story = {
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
    const [restriction, setRestriction] = useState<Restriction>({
      type: 'foreign',
      column: uuids[0],
      reference: {
        table: '',
        column: '',
      },
    });

    return (
      <CreateRestriction
        columns={columns}
        restriction={restriction}
        setRestriction={setRestriction}
        restrictionError={undefined}
      />
    );
  },
};
