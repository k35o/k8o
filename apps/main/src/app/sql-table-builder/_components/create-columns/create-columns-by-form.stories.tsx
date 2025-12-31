import { uuidV4 } from '@repo/helpers/uuid-v4';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
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
      <CreateColumnsByForm
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
      <CreateColumnsByForm
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
      <CreateColumnsByForm
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

export const InputColumnName: Story = {
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
      <CreateColumnsByForm
        columnsEntries={Object.entries(columns)}
        columnsError={undefined}
        handleChangeColumn={handleChangeColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // カラム名のフィールドに入力
    const columnNameField = canvas.getByRole('textbox', { name: 'カラム名' });
    await userEvent.type(columnNameField, 'user_id');

    // 入力値を確認
    await expect(columnNameField).toHaveValue('user_id');
  },
};

export const ChangeColumnType: Story = {
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
      <CreateColumnsByForm
        columnsEntries={Object.entries(columns)}
        columnsError={undefined}
        handleChangeColumn={handleChangeColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 型のセレクトボックスを変更
    const typeSelect = canvas.getByRole('combobox', { name: '型' });
    await userEvent.selectOptions(typeSelect, 'text');

    // 選択値を確認
    await expect(typeSelect).toHaveValue('text');
  },
};

export const ToggleNullable: Story = {
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
      <CreateColumnsByForm
        columnsEntries={Object.entries(columns)}
        columnsError={undefined}
        handleChangeColumn={handleChangeColumn}
        handleDeleteColumn={handleDeleteColumn}
      />
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // null許容のラジオボタンを選択
    const nullableRadio = canvas.getByRole('radio', { name: '許容' });
    await userEvent.click(nullableRadio);

    // 選択状態を確認
    await expect(nullableRadio).toBeChecked();
  },
};
