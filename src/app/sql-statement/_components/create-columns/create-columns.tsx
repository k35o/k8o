import { FC } from 'react';
import { Column, InvalidColumns } from '../../_types/column';
import { Button } from '@/components/button';
import {
  QueueListIcon,
  TableCellsIcon,
} from '@heroicons/react/24/solid';
import { Restriction } from '../../_types/restriction';
import { useCreateColumns } from './hooks';
import { CreateColumnsByForm } from './create-columns-by-form';
import { CreateColumnsByTable } from './create-columns-by-table';
import { useColumnsType } from '../../_state';

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
      <div className="flex flex-col justify-between gap-2 py-2 md:flex-row md:items-center md:gap-0">
        <legend className="text-lg font-bold">カラム情報</legend>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outlined"
            onClick={() =>
              setColumnsType(showTable ? 'form' : 'table')
            }
            startIcon={
              showTable ? (
                <QueueListIcon className="size-6" />
              ) : (
                <TableCellsIcon className="size-6" />
              )
            }
          >
            {showTable ? 'フォーム' : 'テーブル'}形式に変更
          </Button>
          <Button onClick={handleAddColumn}>カラムを追加</Button>
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
