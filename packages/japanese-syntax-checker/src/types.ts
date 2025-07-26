export type Response = {
  text: string;
  msgs: {
    type: 'lint';
    ruleId: string;
    message: string;
    index: number;
    line: number;
    column: number;
    range: number[];
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
