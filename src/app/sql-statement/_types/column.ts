export type ColumnType =
  | 'uuid'
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

export type CreatingColumn = Column & {
  id: string;
};
