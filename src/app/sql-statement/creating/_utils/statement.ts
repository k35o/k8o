import { Column, InvalidColumns } from '../../_types/column';
import { InvalidTable, Table } from '../../_types/table';
import { z } from 'zod';

type Result =
  | {
      isSuccessful: true;
      statement: string;
    }
  | {
      isSuccessful: false;
      invalidTable?: InvalidTable;
      invalidColumns?: InvalidColumns;
      otherErrors?: string[];
    };

const tableSchema = z.object({
  name: z.string().min(1),
  alias: z.string().min(1),
});

const columnsSchema = z.record(
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    alias: z.string().min(1),
    type: z.string().min(1),
    nullable: z.boolean(),
  }),
);

export const makeStatement = (
  table: Table,
  columns: Record<string, Column>,
): Result => {
  const tableResult = tableSchema.safeParse(table);
  if (!tableResult.success) {
    const errors = tableResult.error.issues.reduce(
      (errors: InvalidTable['errors'], issue) => {
        if (issue.path.includes('name')) {
          errors.name = issue.message;
        }
        if (issue.path.includes('alias')) {
          errors.alias = issue.message;
        }
        return errors;
      },
      {},
    );
    return {
      isSuccessful: false,
      invalidTable: {
        type: 'table',
        errors,
      },
    };
  }

  const columnResults = columnsSchema.safeParse(columns);
  if (!columnResults.success) {
    console.log(columnResults.error);
    const errors = columnResults.error.issues.reduce(
      (errors: InvalidColumns['errors'], issue) => {
        const id = issue.path[0];
        const name = issue.path[1];
        if (typeof id !== 'string' || typeof name !== 'string') {
          return errors;
        }
        return {
          ...errors,
          [id]: {
            ...errors[id],
            [name]: issue.message,
          },
        };
      },
      {},
    );
    return {
      isSuccessful: false,
      invalidColumns: {
        type: 'column',
        errors,
      },
    };
  }

  return {
    isSuccessful: true,
    statement: `CREATE TABLE ${table.name} (\n${Object.values(columns)
      .map((column) => {
        if (['timestamp', 'timestamptz'].includes(column.type)) {
          return `  ${column.name} timestamp ${column.nullable ? 'NULL' : 'NOT NULL'} ${column.type === 'timestamptz' ? 'WITH TIME ZONE' : 'WITHOUT TIME ZONE'}`;
        }
        if (['time', 'timetz'].includes(column.type)) {
          return `  ${column.name} time ${column.nullable ? 'NULL' : 'NOT NULL'} ${column.type === 'timetz' ? 'WITH TIME ZONE' : 'WITHOUT TIME ZONE'}`;
        }
        return `  ${column.name} ${column.type} ${column.nullable ? 'NULL' : 'NOT NULL'}`;
      })
      .join(',\n')},\n);`,
  };
};
