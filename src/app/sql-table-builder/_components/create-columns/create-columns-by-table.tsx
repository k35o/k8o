import {
  Column,
  ColumnType,
  InvalidColumns,
} from '../../_types/column';
import { Checkbox } from '@/components/form/checkbox';
import { Select } from '@/components/form/select/select';
import { TextField } from '@/components/form/text-field';
import { IconButton } from '@/components/icon-button';
import { Close } from '@/components/icons';
import { FC, useId } from 'react';

type Props = {
  handleChangeColumn: (id: string) => (column: Column) => void;
  handleDeleteColumn: (id: string) => () => void;
  columnsEntries: [string, Column][];
  columnsError: InvalidColumns['errors'] | undefined;
};

const TYPE_OPTIONS = [
  { value: 'uuid', label: 'uuid' },
  { value: 'serial', label: '自動採番' },
  { value: 'text', label: '文字列' },
  { value: 'integer', label: '整数' },
  { value: 'numeric', label: '数値' },
  { value: 'boolean', label: '真偽値' },
  { value: 'date', label: '日付' },
  { value: 'time', label: '時刻' },
  { value: 'timetz', label: '時刻(タイムゾーン付き)' },
  { value: 'timestamp', label: '日時' },
  { value: 'timestamptz', label: '日時(タイムゾーン付き)' },
] as const satisfies { value: ColumnType; label: string }[];

export const CreateColumnsByTable: FC<Props> = ({
  handleChangeColumn,
  handleDeleteColumn,
  columnsEntries,
  columnsError,
}) => {
  const formId = useId();

  return (
    <div className="border-border-base bg-bg-base w-[calc(100vw-48px)] max-w-[53rem] overflow-x-auto rounded-lg border">
      <table className="w-[51rem]">
        <thead>
          <tr className="border-border-base border-b">
            <th className="px-2 py-3 text-nowrap">カラム名</th>
            <th className="px-2 py-3 text-nowrap">コメント</th>
            <th className="px-2 py-3 text-nowrap">型</th>
            <th className="px-2 py-3 text-nowrap">null許容</th>
            <th className="px-2 py-3 text-nowrap">デフォルト値</th>
            <th className="px-2 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {columnsEntries.map(([id, column], idx) => {
            const columnError = columnsError?.[id];
            return (
              <tr key={id}>
                <td className="px-2 py-3">
                  <TextField
                    id={`column-name_${idx.toString()}-${formId}`}
                    describedbyId={
                      columnError?.name
                        ? `column-name_${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    value={column.name}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        name: e.target.value,
                      });
                    }}
                    placeholder="id"
                    isInvalid={Boolean(columnError?.name)}
                    isDisabled={false}
                    isRequired={true}
                  />
                  {columnError?.name && (
                    <p
                      id={`column-name_${idx.toString()}-${formId}-feedback`}
                      className="text-fg-error text-sm"
                    >
                      {columnError.name}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <TextField
                    id={`column-alias_${idx.toString()}-${formId}`}
                    describedbyId={
                      columnError?.alias
                        ? `column-alias-${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    value={column.alias}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        alias: e.target.value,
                      });
                    }}
                    placeholder="ID"
                    isInvalid={Boolean(columnError?.alias)}
                    isDisabled={false}
                    isRequired={true}
                  />
                  {columnError?.alias && (
                    <p
                      id={`column-alias-${idx.toString()}-${formId}-feedback`}
                      className="text-fg-error text-sm"
                    >
                      {columnError.alias}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <Select
                    id={`column-type_${idx.toString()}-${formId}`}
                    describedbyId={
                      columnError?.type
                        ? `column-type_${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    value={column.type}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        type: e.target.value as ColumnType,
                      });
                    }}
                    options={TYPE_OPTIONS}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired={true}
                  />
                  {columnError?.type && (
                    <p
                      id={`column-type_${idx.toString()}-${formId}-feedback`}
                      className="text-fg-error text-sm"
                    >
                      {columnError.type}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    label=""
                    value={column.nullable}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        nullable: e.target.checked,
                      });
                    }}
                  />
                  {columnError?.nullable && (
                    <p className="text-fg-error text-sm">
                      {columnError.nullable}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <TextField
                    id={`default_${idx.toString()}-${formId}`}
                    describedbyId={
                      columnError?.default
                        ? `default_${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    value={column.default ?? ''}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        default: e.target.value,
                      });
                    }}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired={false}
                  />
                  {columnError?.default && (
                    <p
                      id={`default_${idx.toString()}-${formId}-feedback`}
                      className="text-fg-error text-sm"
                    >
                      {columnError.default}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  {columnsEntries.length > 1 && (
                    <IconButton
                      label="削除"
                      size="sm"
                      onClick={handleDeleteColumn(id)}
                    >
                      <Close />
                    </IconButton>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
