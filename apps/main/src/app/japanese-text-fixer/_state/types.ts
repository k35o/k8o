export type LintMessage = {
  type: 'lint';
  ruleId: string;
  message: string;
  index: number;
  line: number;
  column: number;
  range: [number, number];
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  severity: number;
};

export type Annotation = {
  id: string;
  original: LintMessage;
};

export type Phase = 'input' | 'review' | 'complete';

export type State = {
  phase: Phase;
  inputText: string;
  isChecking: boolean;
  apiResponseText: string;
  reviewText: string;
  annotations: Annotation[];
};

export type Action =
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'START_CHECK' }
  | {
      type: 'CHECK_SUCCESS';
      payload: { text: string; annotations: Annotation[] };
    }
  | { type: 'CHECK_NO_ERRORS'; payload: { text: string } }
  | { type: 'CHECK_FAILURE' }
  | { type: 'SET_REVIEW_TEXT'; payload: string }
  | { type: 'COMPLETE_REVIEW' }
  | { type: 'RESET' };
