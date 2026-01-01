import { Button } from '@k8o/arte-odyssey/button';
import { FormIcon, PlusIcon, TableIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';
import { useColumnsType } from '../../_state';
import type { Column, InvalidColumns } from '../../_types/column';
import type { Restriction } from '../../_types/restriction';
import { CreateColumnsByForm } from './create-columns-by-form';
import { CreateColumnsByTable } from './create-columns-by-table';
import { useCreateColumns } from './hooks';

type Props = {
  columns: Record<string, Column>;
  setColumns: (columns: Record<string, Column>) => void;
  setRestrictions: (
    arg: (
      restrictions: Record<string, Restriction>,
    ) => Record<string, Restriction>,
  ) => void;
  columnsError: InvalidColumns['errors'] | undefined;
};

export const CreateColumns: FC<Props> = ({
  columns,
  setColumns,
  setRestrictions,
  columnsError,
}) => {
  const { handleAddColumn, handleChangeColumn, handleDeleteColumn } =
    useCreateColumns(columns, setColumns, setRestrictions);
  const [columnsType, setColumnsType] = useColumnsType();
  const showTable = columnsType === 'table';

  const columnsEntries = Object.entries(columns);

  return (
    <div className="flex flex-col gap-4">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddColumn}
            size="sm"
            startIcon={<PlusIcon />}
            variant="outlined"
          >
            カラムを追加
          </Button>
          <span className="text-fg-mute text-sm">
            {columnsEntries.length}個のカラム
          </span>
        </div>
        {/* デスクトップのみ表示切り替えボタン */}
        <div className="hidden sm:block">
          <Button
            onClick={() => {
              setColumnsType(showTable ? 'form' : 'table');
            }}
            size="sm"
            startIcon={showTable ? <FormIcon /> : <TableIcon />}
            variant="outlined"
          >
            {showTable ? 'フォーム' : 'テーブル'}形式
          </Button>
        </div>
      </div>

      {/* コンテンツ - スマホではフォーム形式のみ */}
      <div className="sm:hidden">
        <CreateColumnsByForm
          columnsEntries={columnsEntries}
          columnsError={columnsError}
          handleChangeColumn={handleChangeColumn}
          handleDeleteColumn={handleDeleteColumn}
        />
      </div>
      <div className="hidden sm:block">
        {showTable ? (
          <CreateColumnsByTable
            columnsEntries={columnsEntries}
            columnsError={columnsError}
            handleChangeColumn={handleChangeColumn}
            handleDeleteColumn={handleDeleteColumn}
          />
        ) : (
          <CreateColumnsByForm
            columnsEntries={columnsEntries}
            columnsError={columnsError}
            handleChangeColumn={handleChangeColumn}
            handleDeleteColumn={handleDeleteColumn}
          />
        )}
      </div>
    </div>
  );
};
