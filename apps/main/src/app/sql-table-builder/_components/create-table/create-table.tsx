import { FormControl, TextField } from '@k8o/arte-odyssey';
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
    <div className="grid gap-4 sm:grid-cols-2">
      <FormControl
        errorText={tableError?.name}
        invalid={Boolean(tableError?.name)}
        label="テーブル名"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            onChange={handleChangeTableName}
            placeholder="users"
            value={table.name}
            {...props}
          />
        )}
        required
      />
      <FormControl
        errorText={tableError?.alias}
        invalid={Boolean(tableError?.alias)}
        label="コメント"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            onChange={handleChangeTableAlias}
            placeholder="ユーザーテーブル"
            value={table.alias}
            {...props}
          />
        )}
        required
      />
    </div>
  );
};
