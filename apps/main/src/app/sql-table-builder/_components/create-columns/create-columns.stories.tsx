import { uuidV4 } from '@repo/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import type { Column } from '../../_types/column';
import { CreateColumns } from './create-columns';

const meta: Meta<typeof CreateColumns> = {
  title: 'app/sql-table-builder/columns-info',
  component: CreateColumns,
};

export default meta;
type Story = StoryObj<typeof CreateColumns>;

const PrimaryRender = () => {
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
        // no-op
      }}
    />
  );
};

export const Primary: Story = {
  render: () => <PrimaryRender />,
};

const WithMultipleColumnsRender = () => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    [uuidV4()]: {
      name: 'id',
      alias: 'ID',
      type: 'uuid',
      nullable: false,
    },
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
  });
  return (
    <CreateColumns
      columns={columns}
      columnsError={undefined}
      setColumns={setColumns}
      setRestrictions={() => {
        // no-op
      }}
    />
  );
};

export const WithMultipleColumns: Story = {
  render: () => <WithMultipleColumnsRender />,
};

export const AddColumn: Story = {
  render: () => <PrimaryRender />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // カラムを追加ボタンをクリック
    const addButton = canvas.getByRole('button', { name: 'カラムを追加' });
    await userEvent.click(addButton);

    // カラムカウントが更新されることを確認
    await expect(canvas.getByText('2個のカラム')).toBeInTheDocument();
  },
};

export const SwitchViewType: Story = {
  render: () => <PrimaryRender />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 初期状態のボタンを探す（テキストを含むボタン）
    // デスクトップビューポートでのみ表示されるボタン
    const switchButton = await canvas.findByRole('button', {
      name: /形式$/,
    });
    await expect(switchButton).toBeInTheDocument();

    // 形式を切り替え
    await userEvent.click(switchButton);

    // ボタンが引き続き存在することを確認
    await expect(
      await canvas.findByRole('button', { name: /形式$/ }),
    ).toBeInTheDocument();
  },
};
