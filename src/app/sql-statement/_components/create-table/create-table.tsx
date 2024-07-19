import { TextField } from '@/components/form/text-field';
import { FC, useId } from 'react';
import { InvalidTable, Table } from '../../_types/table';

type Props = {
  table: Table;
  setTable: (table: Table) => void;
  tableError: InvalidTable['errors'] | undefined;
};

export const CreateTable: FC<Props> = ({
  table,
  setTable,
  tableError,
}) => {
  const id = useId();

  const handleChangeTableName = (name: string) => {
    setTable({ ...table, name });
  };

  const handleChangeTableAlias = (alias: string) => {
    setTable({ ...table, alias });
  };

  return (
    <fieldset className="rounded-md p-2">
      <legend className="text-lg font-bold">テーブル情報</legend>
      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={`table-name_${id}`} className="font-bold">
            テーブル名
          </label>
          <TextField
            id={`table-name_${id}`}
            value={table.name}
            onChange={handleChangeTableName}
            placeholder="users"
          />
          {tableError?.name && (
            <p className="text-sm text-red-500">{tableError.name}</p>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2">
          <label htmlFor={`table-alias_${id}`} className="font-bold">
            コメント
          </label>
          <TextField
            id={`table-alias_${id}`}
            value={table.alias}
            onChange={handleChangeTableAlias}
            placeholder="ユーザーテーブル"
          />
          {tableError?.alias && (
            <p className="text-sm text-red-500">{tableError.alias}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
