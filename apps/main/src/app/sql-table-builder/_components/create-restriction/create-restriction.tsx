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
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
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

      {/* PRIMARY KEY / UNIQUE の場合 */}
      {(restriction.type === 'primary' || restriction.type === 'unique') && (
        <div className="min-w-0">
          <FormControl
            errorText={restrictionError?.columns}
            isInvalid={Boolean(restrictionError?.columns)}
            isRequired
            label="対象カラム"
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
        </div>
      )}

      {/* FOREIGN KEY の場合 */}
      {restriction.type === 'foreign' && (
        <>
          <FormControl
            errorText={restrictionError?.column}
            isDisabled={columnOptions.length === 0}
            isInvalid={Boolean(restrictionError?.column)}
            isRequired
            label="参照元カラム"
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
            label="参照先テーブル"
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
                  placeholder="users"
                  value={restriction.reference.table}
                />
              );
            }}
          />
          <FormControl
            errorText={restrictionError?.referrence?.column}
            isInvalid={Boolean(restrictionError?.referrence?.column)}
            isRequired
            label="参照先カラム"
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
                  placeholder="id"
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
