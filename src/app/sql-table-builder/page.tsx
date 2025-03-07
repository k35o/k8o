'use client';

import { LoadingCreateColumns } from './_components/create-columns/loading-create-columns';
import { CreateRestrictions } from './_components/create-restrictions';
import { CreateTable } from './_components/create-table';
import { Column, InvalidColumns } from './_types/column';
import {
  InvalidRestrictions,
  Restriction,
} from './_types/restriction';
import { InvalidTable, Table } from './_types/table';
import { makeStatement } from './_utils/statement';
import { Button } from '@/components/button';
import { uuidV4 } from '@/utils/uuid-v4';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

const CreateColumns = dynamic(
  () =>
    import('./_components/create-columns').then(
      (mod) => mod.CreateColumns,
    ),
  { ssr: false, loading: () => <LoadingCreateColumns /> },
);

export default function Page() {
  const topRef = useRef<HTMLElement | null>(null);

  const [table, setTable] = useState<Table>({
    name: '',
    alias: '',
  });
  const [columns, setColumns] = useState<Record<string, Column>>({
    [uuidV4()]: {
      name: '',
      alias: '',
      type: 'uuid',
      nullable: false,
    },
  });
  const [restrictions, setRestrictions] = useState<
    Record<string, Restriction>
  >({
    [uuidV4()]: {
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
    <section ref={topRef} className="grid gap-6 py-4">
      <CreateTable
        table={table}
        setTable={setTable}
        tableError={tableError}
      />
      <CreateColumns
        columns={columns}
        setColumns={setColumns}
        setRestrictions={setRestrictions}
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
            topRef.current?.scrollIntoView();
            return;
          }
          setStatement(statementResult.statement);
        }}
      >
        生成
      </Button>
      {statement && (
        <code
          ref={(node) => {
            node?.scrollIntoView();
          }}
          className="bg-bg-mute sm:text-md rounded-md p-4 text-xs whitespace-pre-wrap"
        >
          {statement}
        </code>
      )}
    </section>
  );
}
