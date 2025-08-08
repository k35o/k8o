import { Button } from '@k8o/arte-odyssey/button';
import { FormIcon, TableIcon } from '@k8o/arte-odyssey/icons';
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
    <fieldset className="relative p-2">
      <div className="flex flex-col justify-between gap-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <legend className="font-bold text-lg">カラム情報</legend>
          <Button onClick={handleAddColumn}>カラムを追加</Button>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setColumnsType(showTable ? 'form' : 'table');
            }}
            startIcon={showTable ? <FormIcon /> : <TableIcon />}
            variant="outlined"
          >
            {showTable ? 'フォーム' : 'テーブル'}形式に変更
          </Button>
        </div>
      </div>
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
    </fieldset>
  );
};
