import {
  Autocomplete,
  FormControl,
  Select,
  TextField,
} from '@k8o/arte-odyssey';
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
] as const satisfies Array<{ value: RestrictionType; label: string }>;

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
        invalid={Boolean(restrictionError?.type)}
        required
        label="種類"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
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
        )}
      />

      {/* PRIMARY KEY / UNIQUE の場合 */}
      {(restriction.type === 'primary' || restriction.type === 'unique') && (
        <div className="min-w-0">
          <FormControl
            errorText={restrictionError?.columns}
            invalid={Boolean(restrictionError?.columns)}
            required
            label="対象カラム"
            renderInput={({ 'aria-labelledby': _, ...props }) => (
              <Autocomplete
                {...props}
                onChange={(selectedColumns) => {
                  setRestriction({ ...restriction, columns: selectedColumns });
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
            disabled={columnOptions.length === 0}
            invalid={Boolean(restrictionError?.column)}
            required
            label="参照元カラム"
            renderInput={({ 'aria-labelledby': _, ...props }) => (
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
            )}
          />
          <FormControl
            errorText={restrictionError?.reference?.table}
            invalid={Boolean(restrictionError?.reference?.table)}
            required
            label="参照先テーブル"
            renderInput={({ 'aria-labelledby': _, ...props }) => (
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
            )}
          />
          <FormControl
            errorText={restrictionError?.reference?.column}
            invalid={Boolean(restrictionError?.reference?.column)}
            required
            label="参照先カラム"
            renderInput={({ 'aria-labelledby': _, ...props }) => (
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
            )}
          />
        </>
      )}
    </div>
  );
};
