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

export type Column = {
  name: string;
  alias: string;
  type: ColumnType;
  nullable: boolean;
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
    }
  >;
};
