import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@/components/accordion';
import { IconButton } from '@/components/icon-button';
import { FC } from 'react';
import {
  Column,
  ColumnType,
  InvalidColumns,
} from '../../_types/column';
import { TextField } from '@/components/form/text-field';
import { Select } from '@/components/form/select/select';
import { Radio } from '@/components/form/radio';
import { FormControl } from '@/components/form/form-control';
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

export const CreateColumnsByForm: FC<Props> = ({
  handleChangeColumn,
  handleDeleteColumn,
  columnsEntries,
  columnsError,
}) => {
  return (
    <Accordion>
      {columnsEntries.map(([id, column], idx) => {
        const columnError = columnsError?.[id];
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
                      <X className="size-6" />
                    </IconButton>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-4">
                  <FormControl
                    label="カラム名"
                    isRequired
                    isInvalid={Boolean(columnError?.name)}
                    errorText={columnError?.name}
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <TextField
                          value={column.name}
                          onChange={(name) => {
                            handleChangeColumn(id)({
                              ...column,
                              name,
                            });
                          }}
                          placeholder="id"
                          {...props}
                        />
                      );
                    }}
                  />
                  <FormControl
                    label="コメント"
                    isRequired
                    isInvalid={Boolean(columnError?.alias)}
                    errorText={columnError?.alias}
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <TextField
                          value={column.alias}
                          onChange={(alias) => {
                            handleChangeColumn(id)({
                              ...column,
                              alias,
                            });
                          }}
                          placeholder="ID"
                          {...props}
                        />
                      );
                    }}
                  />
                  <FormControl
                    label="型"
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <Select
                          value={column.type}
                          onChange={(type) => {
                            handleChangeColumn(id)({
                              ...column,
                              type: type as ColumnType,
                            });
                          }}
                          options={TYPE_OPTIONS}
                          {...props}
                        />
                      );
                    }}
                    isRequired
                    isInvalid={Boolean(columnError?.type)}
                    errorText={columnError?.type}
                  />
                  <FormControl
                    label="null許容"
                    labelAs="legend"
                    isRequired
                    isInvalid={Boolean(columnError?.nullable)}
                    errorText={columnError?.nullable}
                    renderInput={(props) => (
                      <Radio
                        {...props}
                        value={column.nullable ? '0' : '1'}
                        onChange={(type) => {
                          handleChangeColumn(id)({
                            ...column,
                            nullable: type === '0',
                          });
                        }}
                        options={[
                          { value: '0', label: '許容' },
                          { value: '1', label: '不許容' },
                        ]}
                      />
                    )}
                  />
                  <FormControl
                    label="デフォルト値"
                    isInvalid={Boolean(columnError?.default)}
                    errorText={columnError?.default}
                    renderInput={({ labelId: _, ...props }) => {
                      return (
                        <TextField
                          value={column.default ?? ''}
                          onChange={(defaultVal) => {
                            handleChangeColumn(id)({
                              ...column,
                              default: defaultVal,
                            });
                          }}
                          {...props}
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
