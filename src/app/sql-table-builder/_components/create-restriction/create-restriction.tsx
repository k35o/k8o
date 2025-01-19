import { FC } from 'react';
import { Column } from '../../_types/column';
import {
  InvalidRestrictions,
  Restriction,
  RestrictionType,
} from '../../_types/restriction';
import { Select } from '@/components/form/select/select';
import { TextField } from '@/components/form/text-field';
import { Autocomplete } from '@/components/form/autocomplete';
import { FormControl } from '@/components/form/form-control';

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
  const columnOptions = Object.entries(columns)
    // 名前をつけていないカラムは選択肢に含めない
    .filter(([_, column]) => Boolean(column.name))
    .map(([id, column]) => ({
      value: id,
      label: column.name,
    }));

  return (
    <div className="flex flex-col justify-center gap-4">
      <FormControl
        label="種類"
        renderInput={({ labelId: _, ...props }) => {
          return (
            <Select
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
              {...props}
            />
          );
        }}
        isRequired
        isInvalid={Boolean(restrictionError?.type)}
        errorText={restrictionError?.type}
      />
      {(restriction.type === 'primary' ||
        restriction.type === 'unique') && (
        <FormControl
          label="カラム"
          isRequired
          renderInput={({ labelId: _, ...props }) => (
            <Autocomplete
              {...props}
              options={columnOptions}
              value={restriction.columns}
              onChange={(columns) => {
                setRestriction({ ...restriction, columns });
              }}
            />
          )}
          isInvalid={Boolean(restrictionError?.columns)}
          errorText={restrictionError?.columns}
        />
      )}
      {restriction.type === 'foreign' && (
        <>
          <FormControl
            label="参照するカラム"
            isDisabled={columnOptions.length === 0}
            isRequired
            isInvalid={Boolean(restrictionError?.column)}
            errorText={restrictionError?.column}
            renderInput={({ labelId: _, ...props }) => {
              return (
                <Select
                  value={restriction.column}
                  onChange={(column) => {
                    setRestriction({
                      ...restriction,
                      column,
                    });
                  }}
                  options={columnOptions}
                  {...props}
                />
              );
            }}
          />
          <FormControl
            label="参照先のテーブル名"
            isRequired
            isInvalid={Boolean(restrictionError?.referrence?.table)}
            errorText={restrictionError?.referrence?.table}
            renderInput={({ labelId: _, ...props }) => {
              return (
                <TextField
                  {...props}
                  value={restriction.reference.table}
                  onChange={(table) => {
                    setRestriction({
                      ...restriction,
                      reference: { ...restriction.reference, table },
                    });
                  }}
                />
              );
            }}
          />
          <FormControl
            label="参照先のカラム名"
            isRequired
            isInvalid={Boolean(restrictionError?.referrence?.column)}
            errorText={restrictionError?.referrence?.column}
            renderInput={({ labelId: _, ...props }) => {
              return (
                <TextField
                  {...props}
                  value={restriction.reference.column}
                  onChange={(column) => {
                    setRestriction({
                      ...restriction,
                      reference: { ...restriction.reference, column },
                    });
                  }}
                />
              );
            }}
          />
        </>
      )}
    </div>
  );
};
