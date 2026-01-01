export type ColumnType =
  | 'uuid'
  | 'serial'
  | 'integer'
  | 'numeric'
  | 'text'
  | 'boolean'
  | 'date'
  | 'time'
  | 'timetz'
  | 'timestamp'
  | 'timestamptz';

// フォーム用（フルラベル）
export const COLUMN_TYPE_OPTIONS = [
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

// テーブル用（省略ラベル）
export const COLUMN_TYPE_OPTIONS_SHORT = [
  { value: 'uuid', label: 'uuid' },
  { value: 'serial', label: '自動採番' },
  { value: 'text', label: '文字列' },
  { value: 'integer', label: '整数' },
  { value: 'numeric', label: '数値' },
  { value: 'boolean', label: '真偽値' },
  { value: 'date', label: '日付' },
  { value: 'time', label: '時刻' },
  { value: 'timetz', label: '時刻(TZ)' },
  { value: 'timestamp', label: '日時' },
  { value: 'timestamptz', label: '日時(TZ)' },
] as const satisfies { value: ColumnType; label: string }[];

export type Column = {
  name: string;
  alias: string;
  type: ColumnType;
  nullable: boolean;
  default?: string;
};

export type InvalidColumns = {
  type: 'column';
  errors: Record<
    string,
    {
      name?: string;
      alias?: string;
      type?: string;
      nullable?: string;
      default?: string;
    }
  >;
};
