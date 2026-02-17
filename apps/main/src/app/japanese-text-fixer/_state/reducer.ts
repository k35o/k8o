import type { Action, State } from './types';

export const initialState: State = {
  phase: 'input',
  inputText: '',
  isChecking: false,
  apiResponseText: '',
  reviewText: '',
  annotations: [],
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_INPUT_TEXT':
      return { ...state, inputText: action.payload };

    case 'START_CHECK':
      return { ...state, isChecking: true };

    case 'CHECK_SUCCESS':
      return {
        ...state,
        isChecking: false,
        phase: 'review',
        apiResponseText: action.payload.text,
        reviewText: action.payload.text,
        annotations: action.payload.annotations,
      };

    case 'CHECK_NO_ERRORS':
      return {
        ...state,
        isChecking: false,
        phase: 'complete',
        apiResponseText: action.payload.text,
        reviewText: action.payload.text,
        annotations: [],
      };

    case 'CHECK_FAILURE':
      return { ...state, isChecking: false };

    case 'SET_REVIEW_TEXT':
      if (state.phase !== 'review') return state;
      return { ...state, reviewText: action.payload };

    case 'COMPLETE_REVIEW':
      if (state.phase !== 'review') return state;
      return { ...state, phase: 'complete' };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('reducer', () => {
    it('SET_INPUT_TEXT: 入力テキストを更新する', () => {
      const state = reducer(initialState, {
        type: 'SET_INPUT_TEXT',
        payload: 'テスト',
      });
      expect(state.inputText).toBe('テスト');
    });

    it('START_CHECK: チェック中状態にする', () => {
      const state = reducer(initialState, { type: 'START_CHECK' });
      expect(state.isChecking).toBe(true);
    });

    it('CHECK_SUCCESS: レビューフェーズに遷移する', () => {
      const annotations = [
        {
          id: '1',
          original: {
            type: 'lint' as const,
            ruleId: 'test',
            message: 'テスト',
            index: 0,
            line: 1,
            column: 0,
            range: [0, 3] as [number, number],
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 3 },
            },
            severity: 1,
          },
        },
      ];
      const state = reducer(
        { ...initialState, isChecking: true },
        {
          type: 'CHECK_SUCCESS',
          payload: { text: 'テスト', annotations },
        },
      );
      expect(state.phase).toBe('review');
      expect(state.isChecking).toBe(false);
      expect(state.annotations).toEqual(annotations);
      expect(state.reviewText).toBe('テスト');
    });

    it('CHECK_NO_ERRORS: エラーなしで完了フェーズに遷移する', () => {
      const state = reducer(
        { ...initialState, isChecking: true },
        { type: 'CHECK_NO_ERRORS', payload: { text: 'テスト' } },
      );
      expect(state.phase).toBe('complete');
      expect(state.isChecking).toBe(false);
      expect(state.annotations).toEqual([]);
      expect(state.reviewText).toBe('テスト');
    });

    it('CHECK_FAILURE: チェック中状態を解除する', () => {
      const state = reducer(
        { ...initialState, isChecking: true },
        { type: 'CHECK_FAILURE' },
      );
      expect(state.isChecking).toBe(false);
    });

    it('SET_REVIEW_TEXT: レビューテキストを更新する', () => {
      const state = reducer(
        { ...initialState, phase: 'review', reviewText: '元の文' },
        { type: 'SET_REVIEW_TEXT', payload: '修正後の文' },
      );
      expect(state.reviewText).toBe('修正後の文');
    });

    it('SET_REVIEW_TEXT: review以外では更新しない', () => {
      const state = reducer(initialState, {
        type: 'SET_REVIEW_TEXT',
        payload: '修正後の文',
      });
      expect(state.reviewText).toBe('');
    });

    it('COMPLETE_REVIEW: 完了フェーズに遷移する', () => {
      const state = reducer(
        { ...initialState, phase: 'review' },
        { type: 'COMPLETE_REVIEW' },
      );
      expect(state.phase).toBe('complete');
    });

    it('COMPLETE_REVIEW: review以外では遷移しない', () => {
      const state = reducer(initialState, { type: 'COMPLETE_REVIEW' });
      expect(state.phase).toBe('input');
    });

    it('RESET: 初期状態に戻す', () => {
      const state = reducer(
        {
          ...initialState,
          phase: 'complete',
          inputText: 'テスト',
        },
        { type: 'RESET' },
      );
      expect(state).toEqual(initialState);
    });
  });
}
