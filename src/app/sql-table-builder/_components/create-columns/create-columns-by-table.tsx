import { IconButton } from '@/components/icon-button';
import { FC, useId } from 'react';
import {
  Column,
  ColumnType,
  InvalidColumns,
} from '../../_types/column';
import { TextField } from '@/components/form/text-field';
import { Select } from '@/components/form/select/select';
import { Checkbox } from '@/components/form/checkbox';
import { X } from 'lucide-react';

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
    <div className="w-[calc(100vw-64px)] max-w-[51rem] overflow-x-auto rounded-lg border border-borderPrimary bg-bgBase">
      <table className="w-[51rem]">
        <thead>
          <tr className="border-b border-borderPrimary">
            <th className="text-nowrap px-2 py-3">カラム名</th>
            <th className="text-nowrap px-2 py-3">コメント</th>
            <th className="text-nowrap px-2 py-3">型</th>
            <th className="text-nowrap px-2 py-3">null許容</th>
            <th className="text-nowrap px-2 py-3">デフォルト値</th>
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
                    id={`column-name_${idx}-${formId}`}
                    describedbyId={
                      columnError?.name
                        ? `column-name_${idx}-${formId}-feedback`
                        : undefined
                    }
                    value={column.name}
                    onChange={(name) => {
                      handleChangeColumn(id)({ ...column, name });
                    }}
                    placeholder="id"
                    isInvalid={Boolean(columnError?.name)}
                    isDisabled={false}
                    isRequired={true}
                  />
                  {columnError?.name && (
                    <p
                      id={`column-name_${idx}-${formId}-feedback`}
                      className="text-sm text-textError"
                    >
                      {columnError.name}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <TextField
                    id={`column-alias_${idx}-${formId}`}
                    describedbyId={
                      columnError?.alias
                        ? `column-alias-${idx}-${formId}-feedback`
                        : undefined
                    }
                    value={column.alias}
                    onChange={(alias) => {
                      handleChangeColumn(id)({ ...column, alias });
                    }}
                    placeholder="ID"
                    isInvalid={Boolean(columnError?.alias)}
                    isDisabled={false}
                    isRequired={true}
                  />
                  {columnError?.alias && (
                    <p
                      id={`column-alias-${idx}-${formId}-feedback`}
                      className="text-sm text-textError"
                    >
                      {columnError.alias}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <Select
                    id={`column-type_${idx}-${formId}`}
                    describedbyId={
                      columnError?.type
                        ? `column-type_${idx}-${formId}-feedback`
                        : undefined
                    }
                    value={column.type}
                    onChange={(type) => {
                      handleChangeColumn(id)({
                        ...column,
                        type: type as ColumnType,
                      });
                    }}
                    options={TYPE_OPTIONS}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired={true}
                  />
                  {columnError?.type && (
                    <p
                      id={`column-type_${idx}-${formId}-feedback`}
                      className="text-sm text-textError"
                    >
                      {columnError.type}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    label=""
                    value={column.nullable}
                    onChange={(type) => {
                      handleChangeColumn(id)({
                        ...column,
                        nullable: type,
                      });
                    }}
                  />
                  {columnError?.nullable && (
                    <p className="text-sm text-textError">
                      {columnError.nullable}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <TextField
                    id={`default_${idx}-${formId}`}
                    describedbyId={
                      columnError?.default
                        ? `default_${idx}-${formId}-feedback`
                        : undefined
                    }
                    value={column.default ?? ''}
                    onChange={(defaultVal) => {
                      handleChangeColumn(id)({
                        ...column,
                        default: defaultVal,
                      });
                    }}
                    isDisabled={false}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired={false}
                  />
                  {columnError?.default && (
                    <p
                      id={`default_${idx}-${formId}-feedback`}
                      className="text-sm text-textError"
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
                      <X className="size-6" />
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
