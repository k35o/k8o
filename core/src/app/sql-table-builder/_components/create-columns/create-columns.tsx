import { CreateColumnsByForm } from './create-columns-by-form';
import { CreateColumnsByTable } from './create-columns-by-table';
import { useCreateColumns } from './hooks';
import { useColumnsType } from '../../_state';
import { Column, InvalidColumns } from '../../_types/column';
import { Restriction } from '../../_types/restriction';
import { Button } from '@k8o/components/button';
import { FormIcon, TableIcon } from '@k8o/components/icons';
import { FC } from 'react';

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
          <legend className="text-lg font-bold">カラム情報</legend>
          <Button onClick={handleAddColumn}>カラムを追加</Button>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outlined"
            onClick={() => {
              setColumnsType(showTable ? 'form' : 'table');
            }}
            startIcon={showTable ? <FormIcon /> : <TableIcon />}
          >
            {showTable ? 'フォーム' : 'テーブル'}形式に変更
          </Button>
        </div>
      </div>
      {showTable ? (
        <CreateColumnsByTable
          handleChangeColumn={handleChangeColumn}
          handleDeleteColumn={handleDeleteColumn}
          columnsEntries={columnsEntries}
          columnsError={columnsError}
        />
      ) : (
        <CreateColumnsByForm
          handleChangeColumn={handleChangeColumn}
          handleDeleteColumn={handleDeleteColumn}
          columnsEntries={columnsEntries}
          columnsError={columnsError}
        />
      )}
    </fieldset>
  );
};
