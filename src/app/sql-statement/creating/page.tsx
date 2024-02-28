'use client';

import { useState } from 'react';
import { InvalidTable, Table } from '../_types/table';
import { Column, InvalidColumns } from '../_types/column';
import { CreateTable } from '../_components/create-table';
import { CreateColumns } from '../_components/create-columns';
import { Button } from '@/app/_components/button';
import { makeStatement } from './_utils/statement';
import {
  InvalidRestrictions,
  Restriction,
} from '../_types/restriction';
import { CreateRestrictions } from '../_components/create-restrictions';

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
  const [restrictions, setRestrictions] = useState<
    Record<string, Restriction>
  >({
    [crypto.randomUUID()]: {
      type: 'primary',
      columns: [],
    },
  });

  const [statement, setStatement] = useState<string>('');
  const [tableError, setTableError] =
    useState<InvalidTable['errors']>();
  const [columnsError, setColumnsError] =
    useState<InvalidColumns['errors']>();
  const [restroctionsError, setRestroctionsError] =
    useState<InvalidRestrictions['errors']>();

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
      <CreateRestrictions
        columns={columns}
        restrictions={restrictions}
        setRestrictions={setRestrictions}
        restroctionsError={restroctionsError}
      />
      <Button
        onClick={() => {
          setTableError(undefined);
          setColumnsError(undefined);
          setRestroctionsError(undefined);
          setStatement('');
          const statementResult = makeStatement(
            table,
            columns,
            restrictions,
          );
          if (!statementResult.isSuccessful) {
            setTableError(statementResult.invalidTable?.errors);
            setColumnsError(statementResult.invalidColumns?.errors);
            setRestroctionsError(
              statementResult.invalidRestrictions?.errors,
            );
            return;
          }
          setStatement(statementResult.statement);
        }}
      >
        生成
      </Button>
      {statement && (
        <code className="whitespace-pre-wrap rounded-lg bg-bgLight p-4 text-xs sm:text-base">
          {statement}
        </code>
      )}
    </section>
  );
}
