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
        columnsError={undefined}
        setColumns={setColumns}
        setRestrictions={() => {
          console.log();
        }}
      />
    );
  },
};

export const AddColumn: Story = {
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
        columnsError={undefined}
        setColumns={setColumns}
        setRestrictions={() => {
          console.log();
        }}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // カラムを追加ボタンをクリック
    const addButton = canvas.getByRole('button', { name: 'カラムを追加' });
    await userEvent.click(addButton);

    // カラム情報のレジェンドが存在することを確認
    await expect(canvas.getByText('カラム情報')).toBeInTheDocument();
  },
};

export const SwitchViewType: Story = {
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
        columnsError={undefined}
        setColumns={setColumns}
        setRestrictions={() => {
          console.log();
        }}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 初期状態のボタンを探す（テキストを含むボタン）
    const switchButton = canvas.getByRole('button', {
      name: /形式に変更/,
    });
    await expect(switchButton).toBeInTheDocument();

    // 形式を切り替え
    await userEvent.click(switchButton);

    // ボタンが引き続き存在することを確認
    await expect(
      canvas.getByRole('button', { name: /形式に変更/ }),
    ).toBeInTheDocument();
  },
};
