'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { uuidV4 } from '@k8o/helpers/uuid-v4';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { LoadingCreateColumns } from './_components/create-columns/loading-create-columns';
import { CreateRestrictions } from './_components/create-restrictions';
import { CreateTable } from './_components/create-table';
import type { Column, InvalidColumns } from './_types/column';
import type { InvalidRestrictions, Restriction } from './_types/restriction';
import type { InvalidTable, Table } from './_types/table';
import { makeStatement } from './_utils/statement';

const CreateColumns = dynamic(
  () => import('./_components/create-columns').then((mod) => mod.CreateColumns),
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
  const [restrictions, setRestrictions] = useState<Record<string, Restriction>>(
    {
      [uuidV4()]: {
        type: 'primary',
        columns: [],
      },
    },
  );

  const [statement, setStatement] = useState<string>('');
  const [tableError, setTableError] = useState<InvalidTable['errors']>();
  const [columnsError, setColumnsError] = useState<InvalidColumns['errors']>();
  const [restroctionsError, setRestroctionsError] =
    useState<InvalidRestrictions['errors']>();

  return (
    <section className="grid gap-6 py-4" ref={topRef}>
      <CreateTable setTable={setTable} table={table} tableError={tableError} />
      <CreateColumns
        columns={columns}
        columnsError={columnsError}
        setColumns={setColumns}
        setRestrictions={setRestrictions}
      />
      <CreateRestrictions
        columns={columns}
        restrictions={restrictions}
        restroctionsError={restroctionsError}
        setRestrictions={setRestrictions}
      />
      <Button
        onClick={() => {
          setTableError(undefined);
          setColumnsError(undefined);
          setRestroctionsError(undefined);
          setStatement('');
          const statementResult = makeStatement(table, columns, restrictions);
          if (!statementResult.isSuccessful) {
            setTableError(statementResult.invalidTable?.errors);
            setColumnsError(statementResult.invalidColumns?.errors);
            setRestroctionsError(statementResult.invalidRestrictions?.errors);
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
          className="whitespace-pre-wrap rounded-md bg-bg-mute p-4 text-xs sm:text-md"
          ref={(node) => {
            node?.scrollIntoView();
          }}
        >
          {statement}
        </code>
      )}
    </section>
  );
}
