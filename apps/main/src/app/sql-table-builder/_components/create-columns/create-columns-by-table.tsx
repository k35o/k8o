import { Checkbox } from '@k8o/arte-odyssey/form/checkbox';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CloseIcon } from '@k8o/arte-odyssey/icons';
import { type FC, useId } from 'react';
import type { Column, ColumnType, InvalidColumns } from '../../_types/column';

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
    <div className="w-[calc(100vw-48px)] max-w-[53rem] overflow-x-auto rounded-lg border border-border-base bg-bg-base">
      <table className="w-[51rem]">
        <thead>
          <tr className="border-border-base border-b">
            <th className="text-nowrap px-2 py-3">カラム名</th>
            <th className="text-nowrap px-2 py-3">コメント</th>
            <th className="text-nowrap px-2 py-3">型</th>
            <th className="text-nowrap px-2 py-3">null許容</th>
            <th className="text-nowrap px-2 py-3">デフォルト値</th>
            <th className="px-2 py-3">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {columnsEntries.map(([id, column], idx) => {
            const columnError = columnsError?.[id];
            return (
              <tr key={id}>
                <td className="px-2 py-3">
                  <label
                    className="sr-only"
                    htmlFor={`column-name_${idx.toString()}-${formId}`}
                  >
                    カラム名
                  </label>
                  <TextField
                    describedbyId={
                      columnError?.name
                        ? `column-name_${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    id={`column-name_${idx.toString()}-${formId}`}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.name)}
                    isRequired={true}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        name: e.target.value,
                      });
                    }}
                    placeholder="id"
                    value={column.name}
                  />
                  {columnError?.name && (
                    <p
                      className="text-fg-error text-sm"
                      id={`column-name_${idx.toString()}-${formId}-feedback`}
                    >
                      {columnError.name}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <label
                    className="sr-only"
                    htmlFor={`column-alias_${idx.toString()}-${formId}`}
                  >
                    コメント
                  </label>
                  <TextField
                    describedbyId={
                      columnError?.alias
                        ? `column-alias-${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    id={`column-alias_${idx.toString()}-${formId}`}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.alias)}
                    isRequired={true}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        alias: e.target.value,
                      });
                    }}
                    placeholder="ID"
                    value={column.alias}
                  />
                  {columnError?.alias && (
                    <p
                      className="text-fg-error text-sm"
                      id={`column-alias-${idx.toString()}-${formId}-feedback`}
                    >
                      {columnError.alias}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <label
                    className="sr-only"
                    htmlFor={`column-type_${idx.toString()}-${formId}`}
                  >
                    型
                  </label>
                  <Select
                    describedbyId={
                      columnError?.type
                        ? `column-type_${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    id={`column-type_${idx.toString()}-${formId}`}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired={true}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        type: e.target.value as ColumnType,
                      });
                    }}
                    options={TYPE_OPTIONS}
                    value={column.type}
                  />
                  {columnError?.type && (
                    <p
                      className="text-fg-error text-sm"
                      id={`column-type_${idx.toString()}-${formId}-feedback`}
                    >
                      {columnError.type}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    label="null許容"
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        nullable: e.target.checked,
                      });
                    }}
                    value={column.nullable}
                  />
                  {columnError?.nullable && (
                    <p className="text-fg-error text-sm">
                      {columnError.nullable}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <label
                    className="sr-only"
                    htmlFor={`default_${idx.toString()}-${formId}`}
                  >
                    デフォルト値
                  </label>
                  <TextField
                    describedbyId={
                      columnError?.default
                        ? `default_${idx.toString()}-${formId}-feedback`
                        : undefined
                    }
                    id={`default_${idx.toString()}-${formId}`}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired={false}
                    onChange={(e) => {
                      handleChangeColumn(id)({
                        ...column,
                        default: e.target.value,
                      });
                    }}
                    value={column.default ?? ''}
                  />
                  {columnError?.default && (
                    <p
                      className="text-fg-error text-sm"
                      id={`default_${idx.toString()}-${formId}-feedback`}
                    >
                      {columnError.default}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  {columnsEntries.length > 1 && (
                    <IconButton
                      label="削除"
                      onClick={handleDeleteColumn(id)}
                      size="sm"
                    >
                      <CloseIcon />
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
