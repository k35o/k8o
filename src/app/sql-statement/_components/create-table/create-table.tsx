import { TextField } from '@/app/_components/form/text-field';
import { FC, useId } from 'react';
import { Table } from '../../_types/table';

type Props = {
  table: Table;
  setTable: (table: Table) => void;
};

export const CreateTable: FC<Props> = ({ table, setTable }) => {
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
        </div>
      </div>
    </fieldset>
  );
};
