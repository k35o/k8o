import {
  Checkbox,
  CloseIcon,
  IconButton,
  Select,
  TextField,
} from '@k8o/arte-odyssey';
import { type FC, useId } from 'react';

import {
  COLUMN_TYPE_OPTIONS_SHORT,
  type Column,
  type ColumnType,
  type InvalidColumns,
} from '../../_types/column';

type Props = {
  handleChangeColumn: (id: string) => (column: Column) => void;
  handleDeleteColumn: (id: string) => () => void;
  columnsEntries: Array<[string, Column]>;
  columnsError: InvalidColumns['errors'] | undefined;
};

export const CreateColumnsByTable: FC<Props> = ({
  handleChangeColumn,
  handleDeleteColumn,
  columnsEntries,
  columnsError,
}) => {
  const formId = useId();

  return (
    <div className="-mx-6 overflow-x-auto sm:mx-0">
      <div className="min-w-200 px-6 sm:min-w-0 sm:px-0">
        <table className="w-full">
          <thead>
            <tr className="border-border-base bg-bg-mute border-b">
              <th className="text-fg-mute w-10 px-3 py-2.5 text-left text-sm font-medium text-nowrap">
                #
              </th>
              <th className="text-fg-mute px-3 py-2.5 text-left text-sm font-medium text-nowrap">
                カラム名
              </th>
              <th className="text-fg-mute px-3 py-2.5 text-left text-sm font-medium text-nowrap">
                コメント
              </th>
              <th className="text-fg-mute px-3 py-2.5 text-left text-sm font-medium text-nowrap">
                型
              </th>
              <th className="text-fg-mute px-3 py-2.5 text-center text-sm font-medium text-nowrap">
                NULL
              </th>
              <th className="text-fg-mute px-3 py-2.5 text-left text-sm font-medium text-nowrap">
                デフォルト値
              </th>
              <th className="w-12 px-3 py-2.5">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-border-base divide-y">
            {columnsEntries.map(([id, column], idx) => {
              const columnError = columnsError?.[id];
              const hasError = columnError
                ? Object.values(columnError).some(Boolean)
                : false;

              return (
                <tr
                  className={`transition-colors ${hasError ? 'bg-bg-error/5' : 'hover:bg-bg-baseHover'}`}
                  key={id}
                >
                  <td className="px-3 py-2.5">
                    <span className="bg-bg-mute text-fg-mute flex size-6 items-center justify-center rounded font-mono text-xs">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <label
                      className="sr-only"
                      htmlFor={`column-name_${idx.toString()}-${formId}`}
                    >
                      カラム名
                    </label>
                    <TextField
                      describedbyId={
                        columnError?.name === undefined
                          ? undefined
                          : `column-name_${idx.toString()}-${formId}-feedback`
                      }
                      id={`column-name_${idx.toString()}-${formId}`}
                      isDisabled={false}
                      isInvalid={Boolean(columnError?.name)}
                      isRequired
                      onChange={(e) => {
                        handleChangeColumn(id)({
                          ...column,
                          name: e.target.value,
                        });
                      }}
                      placeholder="id"
                      value={column.name}
                    />
                    {columnError?.name !== undefined && (
                      <p
                        className="text-fg-error mt-1 text-xs"
                        id={`column-name_${idx.toString()}-${formId}-feedback`}
                      >
                        {columnError.name}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <label
                      className="sr-only"
                      htmlFor={`column-alias_${idx.toString()}-${formId}`}
                    >
                      コメント
                    </label>
                    <TextField
                      describedbyId={
                        columnError?.alias === undefined
                          ? undefined
                          : `column-alias-${idx.toString()}-${formId}-feedback`
                      }
                      id={`column-alias_${idx.toString()}-${formId}`}
                      isDisabled={false}
                      isInvalid={Boolean(columnError?.alias)}
                      isRequired
                      onChange={(e) => {
                        handleChangeColumn(id)({
                          ...column,
                          alias: e.target.value,
                        });
                      }}
                      placeholder="ID"
                      value={column.alias}
                    />
                    {columnError?.alias !== undefined && (
                      <p
                        className="text-fg-error mt-1 text-xs"
                        id={`column-alias-${idx.toString()}-${formId}-feedback`}
                      >
                        {columnError.alias}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <label
                      className="sr-only"
                      htmlFor={`column-type_${idx.toString()}-${formId}`}
                    >
                      型
                    </label>
                    <Select
                      describedbyId={
                        columnError?.type === undefined
                          ? undefined
                          : `column-type_${idx.toString()}-${formId}-feedback`
                      }
                      id={`column-type_${idx.toString()}-${formId}`}
                      isDisabled={false}
                      isInvalid={Boolean(columnError?.type)}
                      isRequired
                      onChange={(e) => {
                        handleChangeColumn(id)({
                          ...column,
                          type: e.target.value as ColumnType,
                        });
                      }}
                      options={COLUMN_TYPE_OPTIONS_SHORT}
                      value={column.type}
                    />
                    {columnError?.type !== undefined && (
                      <p
                        className="text-fg-error mt-1 text-xs"
                        id={`column-type_${idx.toString()}-${formId}-feedback`}
                      >
                        {columnError.type}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Checkbox
                      label="NULL許容"
                      onChange={(e) => {
                        handleChangeColumn(id)({
                          ...column,
                          nullable: e.target.checked,
                        });
                      }}
                      value={column.nullable}
                    />
                    {columnError?.nullable !== undefined && (
                      <p className="text-fg-error mt-1 text-xs">
                        {columnError.nullable}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <label
                      className="sr-only"
                      htmlFor={`default_${idx.toString()}-${formId}`}
                    >
                      デフォルト値
                    </label>
                    <TextField
                      describedbyId={
                        columnError?.default === undefined
                          ? undefined
                          : `default_${idx.toString()}-${formId}-feedback`
                      }
                      id={`default_${idx.toString()}-${formId}`}
                      isDisabled={false}
                      isInvalid={Boolean(columnError?.default)}
                      isRequired={false}
                      onChange={(e) => {
                        handleChangeColumn(id)({
                          ...column,
                          default: e.target.value,
                        });
                      }}
                      value={column.default ?? ''}
                    />
                    {columnError?.default !== undefined && (
                      <p
                        className="text-fg-error mt-1 text-xs"
                        id={`default_${idx.toString()}-${formId}-feedback`}
                      >
                        {columnError.default}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
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
    </div>
  );
};
