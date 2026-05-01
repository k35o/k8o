import { uuidV4 } from '@repo/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { type Dispatch, type SetStateAction, useState } from 'react';

import type { Column } from '../../_types/column';
import { CreateColumnsByForm } from './create-columns-by-form';

const meta: Meta<typeof CreateColumnsByForm> = {
  title: 'app/sql-table-builder/create-columns-by-form',
  component: CreateColumnsByForm,
};

export default meta;
type Story = StoryObj<typeof CreateColumnsByForm>;

// デフォルトカラムデータを生成するヘルパー
const createDefaultColumn = (): Column => ({
  name: '',
  alias: '',
  type: 'uuid',
  nullable: false,
});

const createChangeColumnHandler =
  (setColumns: Dispatch<SetStateAction<Record<string, Column>>>) =>
  (id: string) =>
  (column: Column) => {
    setColumns((prev) => ({ ...prev, [id]: column }));
  };

const createDeleteColumnHandler =
  (setColumns: Dispatch<SetStateAction<Record<string, Column>>>) =>
  (id: string) =>
  () => {
    setColumns((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

const noopColumnChangeHandler = () => () => {
  // no-op for error display story
};

const PrimaryRender = () => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    [uuidV4()]: createDefaultColumn(),
  });

  return (
    <CreateColumnsByForm
      columnsEntries={Object.entries(columns)}
      columnsError={undefined}
      handleChangeColumn={createChangeColumnHandler(setColumns)}
      handleDeleteColumn={createDeleteColumnHandler(setColumns)}
    />
  );
};

export const Primary: Story = {
  render: () => <PrimaryRender />,
};

const MultipleColumnsRender = () => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    [uuidV4()]: { name: 'id', alias: 'ID', type: 'uuid', nullable: false },
    [uuidV4()]: {
      name: 'name',
      alias: '名前',
      type: 'text',
      nullable: false,
    },
    [uuidV4()]: {
      name: 'created_at',
      alias: '作成日時',
      type: 'timestamptz',
      nullable: false,
    },
  });

  return (
    <CreateColumnsByForm
      columnsEntries={Object.entries(columns)}
      columnsError={undefined}
      handleChangeColumn={createChangeColumnHandler(setColumns)}
      handleDeleteColumn={createDeleteColumnHandler(setColumns)}
    />
  );
};

export const MultipleColumns: Story = {
  render: () => <MultipleColumnsRender />,
};

const errorColumnId = uuidV4();

const WithErrorsRender = () => {
  const [columns] = useState<Record<string, Column>>({
    [errorColumnId]: createDefaultColumn(),
  });

  return (
    <CreateColumnsByForm
      columnsEntries={Object.entries(columns)}
      columnsError={{
        [errorColumnId]: {
          name: 'カラム名は必須です',
          alias: 'コメントは必須です',
        },
      }}
      handleChangeColumn={noopColumnChangeHandler}
      handleDeleteColumn={noopColumnChangeHandler}
    />
  );
};

export const WithErrors: Story = {
  render: () => <WithErrorsRender />,
};
