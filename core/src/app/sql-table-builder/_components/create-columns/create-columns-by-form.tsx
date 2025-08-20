import { Accordion } from '@k8o/arte-odyssey/accordion';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Radio } from '@k8o/arte-odyssey/form/radio';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CloseIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';
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

export const CreateColumnsByForm: FC<Props> = ({
  handleChangeColumn,
  handleDeleteColumn,
  columnsEntries,
  columnsError,
}) => {
  return (
    <Accordion.Root>
      {columnsEntries.map(([id, column], idx) => {
        const columnError = columnsError?.[id];
        return (
          <Accordion.Item defaultOpen={true} key={id}>
            <Accordion.Button>
              <p className="font-bold text-lg">カラム{idx + 1}</p>
            </Accordion.Button>
            <Accordion.Panel>
              <div className="relative">
                {columnsEntries.length > 1 && (
                  <div className="absolute flex w-full items-center justify-end">
                    <IconButton
                      label="削除"
                      onClick={handleDeleteColumn(id)}
                      size="sm"
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-4">
                  <FormControl
                    errorText={columnError?.name}
                    isInvalid={Boolean(columnError?.name)}
                    isRequired
                    label="カラム名"
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <TextField
                          onChange={(e) => {
                            handleChangeColumn(id)({
                              ...column,
                              name: e.target.value,
                            });
                          }}
                          placeholder="id"
                          value={column.name}
                          {...props}
                        />
                      );
                    }}
                  />
                  <FormControl
                    errorText={columnError?.alias}
                    isInvalid={Boolean(columnError?.alias)}
                    isRequired
                    label="コメント"
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <TextField
                          onChange={(e) => {
                            handleChangeColumn(id)({
                              ...column,
                              alias: e.target.value,
                            });
                          }}
                          placeholder="ID"
                          value={column.alias}
                          {...props}
                        />
                      );
                    }}
                  />
                  <FormControl
                    errorText={columnError?.type}
                    isInvalid={Boolean(columnError?.type)}
                    isRequired
                    label="型"
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <Select
                          onChange={(e) => {
                            handleChangeColumn(id)({
                              ...column,
                              type: e.target.value as ColumnType,
                            });
                          }}
                          options={TYPE_OPTIONS}
                          value={column.type}
                          {...props}
                        />
                      );
                    }}
                  />
                  <FormControl
                    errorText={columnError?.nullable}
                    isInvalid={Boolean(columnError?.nullable)}
                    isRequired
                    label="null許容"
                    labelAs="legend"
                    renderInput={(props) => (
                      <Radio
                        {...props}
                        onChange={(e) => {
                          handleChangeColumn(id)({
                            ...column,
                            nullable: e.target.value === '0',
                          });
                        }}
                        options={[
                          { value: '0', label: '許容' },
                          { value: '1', label: '不許容' },
                        ]}
                        value={column.nullable ? '0' : '1'}
                      />
                    )}
                  />
                  <FormControl
                    errorText={columnError?.default}
                    isInvalid={Boolean(columnError?.default)}
                    label="デフォルト値"
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <TextField
                          onChange={(e) => {
                            handleChangeColumn(id)({
                              ...column,
                              default: e.target.value,
                            });
                          }}
                          value={column.default ?? ''}
                          {...props}
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
};
