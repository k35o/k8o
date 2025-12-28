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

export const InputTableInfo: Story = {
  render: () => {
    const [table, setTable] = useState<Table>({
      name: '',
      alias: '',
    });
    return (
      <CreateTable setTable={setTable} table={table} tableError={undefined} />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // テーブル情報のフィールドセットが存在することを確認
    await expect(canvas.getByText('テーブル情報')).toBeInTheDocument();

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
