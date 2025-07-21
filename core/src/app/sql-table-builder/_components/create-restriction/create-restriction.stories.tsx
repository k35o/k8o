import { CreateRestriction } from './create-restriction';
import { Column } from '../../_types/column';
import { Restriction } from '../../_types/restriction';
import { uuidV4 } from '@k8o/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

const meta: Meta<typeof CreateRestriction> = {
  title: 'app/sql-table-builder/create-restriction',
  component: CreateRestriction,
};

export default meta;
type Story = StoryObj<typeof CreateRestriction>;

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
