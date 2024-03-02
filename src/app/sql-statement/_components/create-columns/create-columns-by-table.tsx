import { IconButton } from '@/app/_components/icon-button';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { FC, useId } from 'react';
import {
  Column,
  ColumnType,
  InvalidColumns,
} from '../../_types/column';
import { TextField } from '@/app/_components/form/text-field';
import { Select } from '@/app/_components/form/select/select';
import { Checkbox } from '@/app/_components/form/checkbox';

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
  handleChangeColumn;

  return (
    <div className="w-[calc(100vw-64px)] max-w-[51rem] overflow-x-auto rounded-lg border border-borderLight">
      <table className="w-[51rem]">
        <thead>
          <tr className="border-b border-borderLight">
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
            const columnError = columnsError && columnsError[id];
            return (
              <tr key={id}>
                <td className="px-2 py-3">
                  <TextField
                    id={`column-name_${idx}-${formId}`}
                    value={column.name}
                    onChange={(name) =>
                      handleChangeColumn(id)({ ...column, name })
                    }
                    placeholder="id"
                  />
                  {columnError?.name && (
                    <p className="text-sm text-red-500">
                      {columnError.name}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <TextField
                    id={`column-alias_${idx}-${formId}`}
                    value={column.alias}
                    onChange={(alias) =>
                      handleChangeColumn(id)({ ...column, alias })
                    }
                    placeholder="ID"
                  />
                  {columnError?.alias && (
                    <p className="text-sm text-red-500">
                      {columnError.alias}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <Select
                    id={`column-type_${idx}-${formId}`}
                    value={column.type}
                    onChange={(type) =>
                      handleChangeColumn(id)({
                        ...column,
                        type: type as ColumnType,
                      })
                    }
                    options={TYPE_OPTIONS}
                  />
                  {columnError?.type && (
                    <p className="text-sm text-red-500">
                      {columnError.type}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    label=""
                    value={column.nullable}
                    onChange={(type) =>
                      handleChangeColumn(id)({
                        ...column,
                        nullable: type,
                      })
                    }
                  />
                  {columnError?.nullable && (
                    <p className="text-sm text-red-500">
                      {columnError.nullable}
                    </p>
                  )}
                </td>
                <td className="px-2 py-3">
                  <TextField
                    id={`default_${idx}-${formId}`}
                    value={column.default ?? ''}
                    onChange={(defaultVal) =>
                      handleChangeColumn(id)({
                        ...column,
                        default: defaultVal,
                      })
                    }
                  />
                  {columnError?.default && (
                    <p className="text-sm text-red-500">
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
                      <XMarkIcon className="h-6 w-6" />
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
