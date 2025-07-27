export type Response = {
  text: string;
  msgs: {
    ruleId: string;
    message: string;
    index: number;
    line: number;
    column: number;
    range: readonly [startIndex: number, endIndex: number];
    loc: {
      start: {
        line: number;
        column: number;
      };
      end: {
        line: number;
        column: number;
      };
    };
    severity: number;
  }[];
};
