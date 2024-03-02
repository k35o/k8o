export type Table = {
  name: string;
  alias: string;
};

export type InvalidTable = {
  type: 'table';
  errors: {
    name?: string;
    alias?: string;
  };
};
