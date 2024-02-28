import { Column, InvalidColumns } from '../../_types/column';
import {
  InvalidRestrictions,
  Restriction,
} from '../../_types/restriction';
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
      invalidRestrictions?: InvalidRestrictions;
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

const restrictionsSchema = z.record(
  z.string().min(1),
  z.union([
    z.object({
      type: z.literal('primary'),
      columns: z.array(z.string().min(1)).min(1),
    }),
    z.object({
      type: z.literal('unique'),
      columns: z.array(z.string().min(1)).min(1),
    }),
    z.object({
      type: z.literal('foreign'),
      column: z.string().min(1),
      reference: z.object({
        table: z.string().min(1),
        column: z.string().min(1),
      }),
    }),
  ]),
);

export const makeStatement = (
  table: Table,
  columns: Record<string, Column>,
  restrictions: Record<string, Restriction>,
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

  const restrictionResults =
    restrictionsSchema.safeParse(restrictions);
  if (!restrictionResults.success) {
    const errors = restrictionResults.error.issues.reduce(
      (errors: InvalidRestrictions['errors'], issue) => {
        const id = issue.path[0];
        const type = issue.path[1];
        if (typeof id !== 'string' || typeof type !== 'string') {
          return errors;
        }
        if (type === 'reference') {
          const reference = issue.path[2];
          if (typeof reference !== 'string') {
            return errors;
          }
          return {
            ...errors,
            [id]: {
              ...errors[id],
              referrence: {
                ...errors[id]?.referrence,
                [reference]: issue.message,
              },
            },
          };
        }
        return {
          ...errors,
          [id]: {
            ...errors[id],
            [type]: issue.message,
          },
        };
      },
      {},
    );
    return {
      isSuccessful: false,
      invalidRestrictions: {
        type: 'restriction',
        errors,
      },
    };
  }

  return {
    isSuccessful: true,
    statement: `CREATE TABLE ${table.name} (\n${Object.values(columns)
      .map((column) => {
        const defaultQuery = column.default
          ? ` DEFAULT ${column.default}`
          : '';
        if (['timestamp', 'timestamptz'].includes(column.type)) {
          return `  ${column.name} timestamp ${column.nullable ? 'NULL' : 'NOT NULL'} ${column.type === 'timestamptz' ? 'WITH TIME ZONE' : 'WITHOUT TIME ZONE'}${defaultQuery}`;
        }
        if (['time', 'timetz'].includes(column.type)) {
          return `  ${column.name} time ${column.nullable ? 'NULL' : 'NOT NULL'} ${column.type === 'timetz' ? 'WITH TIME ZONE' : 'WITHOUT TIME ZONE'}${defaultQuery}`;
        }
        return `  ${column.name} ${column.type} ${column.nullable ? 'NULL' : 'NOT NULL'}${defaultQuery}`;
      })
      .join(',\n')},\n${Object.values(restrictions).map(
      (restriction) => {
        if (restriction.type === 'primary') {
          const columnNames = restriction.columns.reduce(
            (acc, column) => {
              const columnName = columns[column]?.name;
              if (!columnName) {
                return acc;
              }
              if (!acc) {
                return columnName;
              }
              return `${acc}, ${columnName}`;
            },
            '',
          );
          return `\n  PRIMARY KEY (${columnNames})`;
        }
        if (restriction.type === 'unique') {
          const columnNames = restriction.columns.reduce(
            (acc, column) => {
              const columnName = columns[column]?.name;
              if (!columnName) {
                return acc;
              }
              if (!acc) {
                return columnName;
              }
              return `${acc}, ${columnName}`;
            },
            '',
          );
          return `\n  UNIQUE (${columnNames})`;
        }
        if (restriction.type === 'foreign') {
          const columnName = columns[restriction.column]?.name;
          if (!columnName) {
            return '';
          }
          return `\n  FOREIGN KEY (${columnName}) REFERENCES ${restriction.reference.table}(${restriction.reference.column})`;
        }
        return '';
      },
    )}\n);\n\nCOMMENT ON TABLE ${table.name} IS '${table.alias}';\n${Object.values(
      columns,
    )
      .map((column) => {
        return `COMMENT ON COLUMN ${table.name}.${column.name} IS '${column.alias}';`;
      })
      .join('\n')}`,
  };
};
