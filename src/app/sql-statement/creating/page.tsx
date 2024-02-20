'use client';

import { useState } from 'react';
import { InvalidTable, Table } from '../_types/table';
import { Column, InvalidColumns } from '../_types/column';
import { CreateTable } from '../_components/create-table';
import { CreateColumns } from '../_components/create-columns';
import { Button } from '@/app/_components/button';
import { makeStatement } from './_utils/statement';

export default function Page() {
  const [table, setTable] = useState<Table>({
    name: '',
    alias: '',
  });
  const [columns, setColumns] = useState<Record<string, Column>>({
    [crypto.randomUUID()]: {
      name: '',
      alias: '',
      type: 'uuid',
      nullable: false,
    },
  });
  const [statement, setStatement] = useState<string>('');
  const [tableError, setTableError] =
    useState<InvalidTable['errors']>();
  const [columnsError, setColumnsError] =
    useState<InvalidColumns['errors']>();

  return (
    <section className="flex flex-col gap-6 rounded-md bg-white p-4">
      <CreateTable
        table={table}
        setTable={setTable}
        tableError={tableError}
      />
      <CreateColumns
        columns={columns}
        setColumns={setColumns}
        columnsError={columnsError}
      />
      <Button
        onClick={() => {
          setTableError(undefined);
          setColumnsError(undefined);
          const statementResult = makeStatement(table, columns);
          if (!statementResult.isSuccessful) {
            setTableError(statementResult.invalidTable?.errors);
            setColumnsError(statementResult.invalidColumns?.errors);
            return;
          }
          setStatement(statementResult.statement);
        }}
      >
        生成
      </Button>
      <textarea
        className="h-32 w-full whitespace-pre-wrap rounded-md p-2"
        value={statement}
        readOnly
      />
    </section>
  );
}
