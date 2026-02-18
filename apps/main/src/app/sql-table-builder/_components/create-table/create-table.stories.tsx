import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import type { Table } from '../../_types/table';
import { CreateTable } from './create-table';

const meta: Meta<typeof CreateTable> = {
  title: 'app/sql-table-builder/create-table',
};

export default meta;
type Story = StoryObj<typeof CreateTable>;

const PrimaryRender = () => {
  const [table, setTable] = useState<Table>({
    name: '',
    alias: '',
  });
  return (
    <CreateTable setTable={setTable} table={table} tableError={undefined} />
  );
};

export const Primary: Story = {
  render: () => <PrimaryRender />,
};

export const InputTableInfo: Story = {
  render: () => <PrimaryRender />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // テキストボックスを取得して入力
    const textboxes = canvas.getAllByRole('textbox');
    const tableNameField = textboxes[0];
    const aliasField = textboxes[1];

    if (tableNameField) {
      await userEvent.type(tableNameField, 'users');
      await expect(tableNameField).toHaveValue('users');
    }

    if (aliasField) {
      await userEvent.type(aliasField, 'ユーザーテーブル');
      await expect(aliasField).toHaveValue('ユーザーテーブル');
    }
  },
};

const WithErrorRender = () => {
  const [table, setTable] = useState<Table>({
    name: '',
    alias: '',
  });
  return (
    <CreateTable
      setTable={setTable}
      table={table}
      tableError={{
        name: 'テーブル名は必須です',
        alias: 'コメントは必須です',
      }}
    />
  );
};

export const WithError: Story = {
  render: () => <WithErrorRender />,
};
