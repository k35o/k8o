import { InvalidTable, Table } from '../../_types/table';
import { FormControl } from '@/components/form/form-control';
import { TextField } from '@/components/form/text-field';
import { ChangeEvent, FC } from 'react';

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
  const handleChangeTableName = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setTable({ ...table, name: e.target.value });
  };

  const handleChangeTableAlias = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setTable({ ...table, alias: e.target.value });
  };

  return (
    <fieldset className="p-2">
      <legend className="text-lg font-bold">テーブル情報</legend>
      <div className="flex flex-col justify-center gap-4">
        <FormControl
          label="テーブル名"
          isRequired
          isInvalid={Boolean(tableError?.name)}
          errorText={tableError?.name}
          renderInput={({ labelId: _, ...props }) => {
            return (
              <TextField
                value={table.name}
                onChange={handleChangeTableName}
                placeholder="users"
                {...props}
              />
            );
          }}
        />
        <FormControl
          label="コメント"
          isRequired
          isInvalid={Boolean(tableError?.alias)}
          errorText={tableError?.alias}
          renderInput={({ labelId: _, ...props }) => {
            return (
              <TextField
                value={table.alias}
                onChange={handleChangeTableAlias}
                placeholder="ユーザーテーブル"
                {...props}
              />
            );
          }}
        />
      </div>
    </fieldset>
  );
};
