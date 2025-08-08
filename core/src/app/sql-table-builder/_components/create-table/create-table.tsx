import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import type { ChangeEvent, FC } from 'react';
import type { InvalidTable, Table } from '../../_types/table';

type Props = {
  table: Table;
  setTable: (table: Table) => void;
  tableError: InvalidTable['errors'] | undefined;
};

export const CreateTable: FC<Props> = ({ table, setTable, tableError }) => {
  const handleChangeTableName = (e: ChangeEvent<HTMLInputElement>) => {
    setTable({ ...table, name: e.target.value });
  };

  const handleChangeTableAlias = (e: ChangeEvent<HTMLInputElement>) => {
    setTable({ ...table, alias: e.target.value });
  };

  return (
    <fieldset className="p-2">
      <legend className="font-bold text-lg">テーブル情報</legend>
      <div className="flex flex-col justify-center gap-4">
        <FormControl
          errorText={tableError?.name}
          isInvalid={Boolean(tableError?.name)}
          isRequired
          label="テーブル名"
          renderInput={({ labelId: _, ...props }) => {
            return (
              <TextField
                onChange={handleChangeTableName}
                placeholder="users"
                value={table.name}
                {...props}
              />
            );
          }}
        />
        <FormControl
          errorText={tableError?.alias}
          isInvalid={Boolean(tableError?.alias)}
          isRequired
          label="コメント"
          renderInput={({ labelId: _, ...props }) => {
            return (
              <TextField
                onChange={handleChangeTableAlias}
                placeholder="ユーザーテーブル"
                value={table.alias}
                {...props}
              />
            );
          }}
        />
      </div>
    </fieldset>
  );
};
