import { FC, useId } from 'react';
import { Column } from '../../_types/column';
import {
  InvalidRestrictions,
  Restriction,
  RestrictionType,
} from '../../_types/restriction';
import { Select } from '@/app/_components/form/select/select';
import { TextField } from '@/app/_components/form/text-field';
import { Autocomplete } from '@/app/_components/form/autocomplete';

const TYPE_OPTIONS = [
  { value: 'primary', label: 'PRIMARY KEY' },
  { value: 'unique', label: 'UNIQUE' },
  { value: 'foreign', label: 'FOREIGN KEY' },
] as const satisfies { value: RestrictionType; label: string }[];

type Props = {
  columns: Record<string, Column>;
  restriction: Restriction;
  setRestriction: (restriction: Restriction) => void;
  restrictionError:
    | InvalidRestrictions['errors']['string']
    | undefined;
};

export const CreateRestriction: FC<Props> = ({
  columns,
  restriction,
  setRestriction,
  restrictionError,
}) => {
  const id = useId();

  const columnOptions = Object.entries(columns).map(
    ([id, column]) => ({
      value: id,
      label: column.name,
    }),
  );

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`restriction-type_${id}`}
          className="font-bold"
        >
          種類
        </label>
        <Select
          id={`restriction-type_${id}`}
          value={restriction.type}
          onChange={(type) => {
            if (type === 'primary') {
              setRestriction({ type, columns: [] });
            } else if (type === 'unique') {
              setRestriction({ type, columns: [] });
            } else if (type === 'foreign') {
              setRestriction({
                type,
                column: columnOptions[0]?.value ?? '',
                reference: {
                  table: '',
                  column: '',
                },
              });
            }
          }}
          options={TYPE_OPTIONS}
        />
        {restrictionError?.type && (
          <p className="text-sm text-red-500">
            {restrictionError.type}
          </p>
        )}
      </div>
      {(restriction.type === 'primary' ||
        restriction.type === 'unique') && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`columns_${id}`} className="font-bold">
            カラム
          </label>
          <Autocomplete
            id={`columns_${id}`}
            options={columnOptions}
            value={restriction.columns}
            onChange={(columns) =>
              setRestriction({ ...restriction, columns })
            }
          />
          {restrictionError?.columns && (
            <p className="text-sm text-red-500">
              {restrictionError.columns}
            </p>
          )}
        </div>
      )}
      {restriction.type === 'foreign' && (
        <>
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`referrer-column_${id}`}
              className="font-bold"
            >
              参照するカラム
            </label>
            <Select
              id={`referrer-column_${id}`}
              value={restriction.column}
              onChange={(column) => {
                if (restriction.type === 'foreign') {
                  setRestriction({
                    ...restriction,
                    column,
                  });
                }
              }}
              options={columnOptions}
            />
            {restrictionError?.column && (
              <p className="text-sm text-red-500">
                {restrictionError.column}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`reference-tablee_${id}`}
              className="font-bold"
            >
              参照先のテーブル名
            </label>
            <TextField
              id={`reference-table_${id}`}
              value={restriction.reference.table}
              onChange={(table) =>
                setRestriction({
                  ...restriction,
                  reference: { ...restriction.reference, table },
                })
              }
            />
            {restrictionError?.referrence?.table && (
              <p className="text-sm text-red-500">
                {restrictionError.referrence.table}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`reference-column_${id}`}
              className="font-bold"
            >
              参照先のカラム名
            </label>
            <TextField
              id={`reference-column_${id}`}
              value={restriction.reference.column}
              onChange={(column) =>
                setRestriction({
                  ...restriction,
                  reference: { ...restriction.reference, column },
                })
              }
            />
            {restrictionError?.referrence?.column && (
              <p className="text-sm text-red-500">
                {restrictionError.referrence.column}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
