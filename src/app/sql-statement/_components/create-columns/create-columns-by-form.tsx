import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/components/accordion';
import { IconButton } from '@/components/icon-button';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { FC, useId } from 'react';
import {
  Column,
  ColumnType,
  InvalidColumns,
} from '../../_types/column';
import { TextField } from '@/components/form/text-field';
import { Select } from '@/components/form/select/select';
import { Radio } from '@/components/form/radio';
import { FormControl } from '@/components/form/form-control/form-control';

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
  const formId = useId();

  return (
    <Accordion>
      {columnsEntries.map(([id, column], idx) => {
        const columnError = columnsError && columnsError[id];
        return (
          <AccordionItem key={id} defaultOpen={true}>
            <AccordionButton>
              <p className="text-lg font-bold">カラム{idx + 1}</p>
            </AccordionButton>
            <AccordionPanel>
              <div className="relative">
                {columnsEntries.length > 1 && (
                  <div className="absolute flex w-full items-center justify-end">
                    <IconButton
                      label="削除"
                      size="sm"
                      onClick={handleDeleteColumn(id)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </IconButton>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`column-name_${idx}-${formId}`}
                      className="font-bold"
                    >
                      カラム名
                    </label>
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
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`column-alias_${idx}-${formId}`}
                      className="font-bold"
                    >
                      コメント
                    </label>
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
                  </div>
                  <FormControl
                    label="型"
                    renderInput={({ describedbyId, ...props }) => {
                      return (
                        <Select
                          describedbyId={describedbyId}
                          value={column.type}
                          onChange={(type) =>
                            handleChangeColumn(id)({
                              ...column,
                              type: type as ColumnType,
                            })
                          }
                          options={TYPE_OPTIONS}
                          {...props}
                        />
                      );
                    }}
                    isRequired
                    isInvalid={Boolean(columnError?.type)}
                    errorText={columnError?.type}
                  />
                  <div className="flex flex-col gap-2">
                    <p
                      id={`nullable_${idx}-${formId}`}
                      className="font-bold"
                    >
                      null許容
                    </p>
                    <Radio
                      labelledById={`nullable_${idx}-${formId}`}
                      value={column.nullable ? '0' : '1'}
                      onChange={(type) =>
                        handleChangeColumn(id)({
                          ...column,
                          nullable: type === '0',
                        })
                      }
                      options={[
                        { value: '0', label: '許容' },
                        { value: '1', label: '不許容' },
                      ]}
                    />
                    {columnError?.nullable && (
                      <p className="text-sm text-red-500">
                        {columnError.nullable}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p
                      id={`default_${idx}-${formId}`}
                      className="font-bold"
                    >
                      デフォルト値
                    </p>
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
                  </div>
                </div>
              </div>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
