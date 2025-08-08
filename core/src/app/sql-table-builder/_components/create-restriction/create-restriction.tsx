import { Autocomplete } from '@k8o/arte-odyssey/form/autocomplete';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import type { FC } from 'react';
import type { Column } from '../../_types/column';
import type {
  InvalidRestrictions,
  Restriction,
  RestrictionType,
} from '../../_types/restriction';

const TYPE_OPTIONS = [
  { value: 'primary', label: 'PRIMARY KEY' },
  { value: 'unique', label: 'UNIQUE' },
  { value: 'foreign', label: 'FOREIGN KEY' },
] as const satisfies { value: RestrictionType; label: string }[];

type Props = {
  columns: Record<string, Column>;
  restriction: Restriction;
  setRestriction: (restriction: Restriction) => void;
  restrictionError: InvalidRestrictions['errors']['string'] | undefined;
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
        errorText={restrictionError?.type}
        isInvalid={Boolean(restrictionError?.type)}
        isRequired
        label="種類"
        renderInput={({ labelId: _, ...props }) => {
          return (
            <Select
              onChange={(e) => {
                const type = e.target.value;
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
              value={restriction.type}
              {...props}
            />
          );
        }}
      />
      {(restriction.type === 'primary' || restriction.type === 'unique') && (
        <FormControl
          errorText={restrictionError?.columns}
          isInvalid={Boolean(restrictionError?.columns)}
          isRequired
          label="カラム"
          renderInput={({ labelId: _, ...props }) => (
            <Autocomplete
              {...props}
              onChange={(columns) => {
                setRestriction({ ...restriction, columns });
              }}
              options={columnOptions}
              value={restriction.columns}
            />
          )}
        />
      )}
      {restriction.type === 'foreign' && (
        <>
          <FormControl
            errorText={restrictionError?.column}
            isDisabled={columnOptions.length === 0}
            isInvalid={Boolean(restrictionError?.column)}
            isRequired
            label="参照するカラム"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <Select
                  onChange={(e) => {
                    setRestriction({
                      ...restriction,
                      column: e.target.value,
                    });
                  }}
                  options={columnOptions}
                  value={restriction.column}
                  {...props}
                />
              );
            }}
          />
          <FormControl
            errorText={restrictionError?.referrence?.table}
            isInvalid={Boolean(restrictionError?.referrence?.table)}
            isRequired
            label="参照先のテーブル名"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <TextField
                  {...props}
                  onChange={(e) => {
                    setRestriction({
                      ...restriction,
                      reference: {
                        ...restriction.reference,
                        table: e.target.value,
                      },
                    });
                  }}
                  value={restriction.reference.table}
                />
              );
            }}
          />
          <FormControl
            errorText={restrictionError?.referrence?.column}
            isInvalid={Boolean(restrictionError?.referrence?.column)}
            isRequired
            label="参照先のカラム名"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <TextField
                  {...props}
                  onChange={(e) => {
                    setRestriction({
                      ...restriction,
                      reference: {
                        ...restriction.reference,
                        column: e.target.value,
                      },
                    });
                  }}
                  value={restriction.reference.column}
                />
              );
            }}
          />
        </>
      )}
    </div>
  );
};
