import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Radio } from '@k8o/arte-odyssey/form/radio';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { ChevronIcon, CloseIcon } from '@k8o/arte-odyssey/icons';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useState } from 'react';
import {
  COLUMN_TYPE_OPTIONS,
  type Column,
  type ColumnType,
  type InvalidColumns,
} from '../../_types/column';

type Props = {
  handleChangeColumn: (id: string) => (column: Column) => void;
  handleDeleteColumn: (id: string) => () => void;
  columnsEntries: [string, Column][];
  columnsError: InvalidColumns['errors'] | undefined;
};

// 個別のカラムアイテムコンポーネント
const ColumnItem: FC<{
  id: string;
  column: Column;
  index: number;
  columnError: InvalidColumns['errors'][string] | undefined;
  handleChangeColumn: (id: string) => (column: Column) => void;
  handleDeleteColumn: (id: string) => () => void;
  canDelete: boolean;
}> = ({
  id,
  column,
  index,
  columnError,
  handleChangeColumn,
  handleDeleteColumn,
  canDelete,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-border-base bg-bg-base"
      exit={{ opacity: 0, y: -10, height: 0 }}
      initial={{ opacity: 0, y: -10 }}
      layout
      transition={{ duration: 0.2 }}
    >
      {/* ヘッダー */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
        <button
          aria-expanded={isOpen}
          className="flex flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-bg-mute font-mono text-fg-mute text-xs">
            {index + 1}
          </span>
          <span className="font-medium">
            {column.name || `カラム ${index + 1}`}
          </span>
          {column.name && (
            <span className="text-fg-mute text-sm">
              ({COLUMN_TYPE_OPTIONS.find((t) => t.value === column.type)?.label}
              )
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronIcon direction="down" />
          </motion.div>
        </button>
        {canDelete && (
          <IconButton
            label="削除"
            onClick={() => {
              handleDeleteColumn(id)();
            }}
            size="sm"
          >
            <CloseIcon />
          </IconButton>
        )}
      </div>

      {/* コンテンツ */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-border-base border-t px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                        options={COLUMN_TYPE_OPTIONS}
                        value={column.type}
                        {...props}
                      />
                    );
                  }}
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
                <div className="sm:col-span-2">
                  <FormControl
                    errorText={columnError?.nullable}
                    isInvalid={Boolean(columnError?.nullable)}
                    isRequired
                    label="NULL許容"
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
                          { value: '0', label: '許容する' },
                          { value: '1', label: '許容しない' },
                        ]}
                        value={column.nullable ? '0' : '1'}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CreateColumnsByForm: FC<Props> = ({
  handleChangeColumn,
  handleDeleteColumn,
  columnsEntries,
  columnsError,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {columnsEntries.map(([id, column], idx) => {
          const columnError = columnsError?.[id];
          return (
            <ColumnItem
              canDelete={columnsEntries.length > 1}
              column={column}
              columnError={columnError}
              handleChangeColumn={handleChangeColumn}
              handleDeleteColumn={handleDeleteColumn}
              id={id}
              index={idx}
              key={id}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
