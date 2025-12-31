import { uuidV4 } from '@repo/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import type { Column } from '../../_types/column';
import { CreateColumnsByTable } from './create-columns-by-table';

const meta: Meta<typeof CreateColumnsByTable> = {
  title: 'app/sql-table-builder/create-columns-by-table',
  component: CreateColumnsByTable,
};

export default meta;
type Story = StoryObj<typeof CreateColumnsByTable>;

// デフォルトカラムデータを生成するヘルパー
const createDefaultColumn = (): Column => ({
  name: '',
  alias: '',
  type: 'uuid',
  nullable: false,
});

export const Primary: Story = {
  render: () => {
    const [columns, setColumns] = useState<Record<string, Column>>({
      [uuidV4()]: createDefaultColumn(),
    });

    const handleChangeColumn = (id: string) => (column: Column) => {
      setColumns((prev) => ({ ...prev, [id]: column }));
    };

    const handleDeleteColumn = (id: string) => () => {
      setColumns((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    };

    return (
      <CreateColumnsByTable
        columnsEntries={Object.entries(columns)}
        columnsError={undefined}
        handleChangeColumn={handleChangeColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    );
  },
};

export const MultipleColumns: Story = {
  render: () => {
    const [columns, setColumns] = useState<Record<string, Column>>({
      [uuidV4()]: { name: 'id', alias: 'ID', type: 'uuid', nullable: false },
      [uuidV4()]: {
        name: 'name',
        alias: '名前',
        type: 'text',
        nullable: false,
      },
      [uuidV4()]: {
        name: 'email',
        alias: 'メールアドレス',
        type: 'text',
        nullable: true,
      },
      [uuidV4()]: {
        name: 'created_at',
        alias: '作成日時',
        type: 'timestamptz',
        nullable: false,
      },
    });

    const handleChangeColumn = (id: string) => (column: Column) => {
      setColumns((prev) => ({ ...prev, [id]: column }));
    };

    const handleDeleteColumn = (id: string) => () => {
      setColumns((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    };

    return (
      <CreateColumnsByTable
        columnsEntries={Object.entries(columns)}
        columnsError={undefined}
        handleChangeColumn={handleChangeColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    );
  },
};

export const WithErrors: Story = {
  render: () => {
    const columnId = uuidV4();
    const [columns] = useState<Record<string, Column>>({
      [columnId]: createDefaultColumn(),
    });

    const handleChangeColumn = () => () => {
      // no-op for error display story
    };
    const handleDeleteColumn = () => () => {
      // no-op for error display story
    };

    return (
      <CreateColumnsByTable
        columnsEntries={Object.entries(columns)}
        columnsError={{
          [columnId]: {
            name: 'カラム名は必須です',
            alias: 'コメントは必須です',
          },
        }}
        handleChangeColumn={handleChangeColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    );
  },
};
