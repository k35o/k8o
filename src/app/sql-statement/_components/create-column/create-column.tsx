import { FC, useId } from 'react';
import {
  ColumnType,
  Column,
  InvalidColumns,
} from '../../_types/column';
import { TextField } from '@/app/_components/form/text-field';
import { Select } from '@/app/_components/form/select/select';
import { Radio } from '@/app/_components/form/radio';

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

type Props = {
  column: Column;
  setColumn: (column: Column) => void;
  columnError: InvalidColumns['errors'][string] | undefined;
};

export const CreateColumn: FC<Props> = ({
  column,
  setColumn,
  columnError,
}) => {
  const id = useId();

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`column-name_${id}`} className="font-bold">
          カラム名
        </label>
        <TextField
          id={`column-name_${id}`}
          value={column.name}
          onChange={(name) => setColumn({ ...column, name })}
          placeholder="id"
        />
        {columnError?.name && (
          <p className="text-sm text-red-500">{columnError.name}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`column-alias_${id}`} className="font-bold">
          コメント
        </label>
        <TextField
          id={`column-alias_${id}`}
          value={column.alias}
          onChange={(alias) => setColumn({ ...column, alias })}
          placeholder="ID"
        />
        {columnError?.alias && (
          <p className="text-sm text-red-500">{columnError.alias}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`column-type_${id}`} className="font-bold">
          型
        </label>
        <Select
          id={`column-type_${id}`}
          value={column.type}
          onChange={(type) =>
            setColumn({ ...column, type: type as ColumnType })
          }
          options={TYPE_OPTIONS}
        />
        {columnError?.type && (
          <p className="text-sm text-red-500">{columnError.type}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p id={`nullable_${id}`} className="font-bold">
          null許容
        </p>
        <Radio
          labelledById={`nullable_${id}`}
          value={column.nullable ? '0' : '1'}
          onChange={(type) =>
            setColumn({ ...column, nullable: type === '0' })
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
        <p id={`default_${id}`} className="font-bold">
          デフォルト値
        </p>
        <TextField
          id={`default_${id}`}
          value={column.default ?? ''}
          onChange={(defaultVal) =>
            setColumn({ ...column, default: defaultVal })
          }
        />
        {columnError?.default && (
          <p className="text-sm text-red-500">
            {columnError.default}
          </p>
        )}
      </div>
    </div>
  );
};
