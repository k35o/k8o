import { checkAnswer } from './check-answer';

describe('checkAnswer', () => {
  it('同じ文字列であればtrueを返す', () => {
    const result = 'answer';
    const answer = 'answer';
    expect(checkAnswer(result, answer)).toBeTruthy();
  });

  it('異なる文字列であればfalseを返す', () => {
    const result = 'answer';
    const answer = 'incorrect';
    expect(checkAnswer(result, answer)).toBeFalsy();
  });

  it('スペースを無視して判定する', () => {
    const result = '  answer  ';
    const answer = 'answer';
    expect(checkAnswer(result, answer)).toBeTruthy();
  });
});
