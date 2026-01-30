export type RestrictionType = 'primary' | 'unique' | 'foreign';

export type Restriction =
  | {
      type: 'primary';
      columns: string[];
    }
  | {
      type: 'unique';
      columns: string[];
    }
  | {
      type: 'foreign';
      column: string;
      reference: {
        table: string;
        column: string;
      };
    };

export type InvalidRestrictions = {
  type: 'restriction';
  errors: Record<
    string,
    {
      type?: string;
      columns?: string;
      column?: string;
      reference?: {
        table?: string;
        column?: string;
      };
    }
  >;
};
