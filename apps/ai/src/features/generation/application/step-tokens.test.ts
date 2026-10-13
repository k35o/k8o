import { sumStepTokens } from './step-tokens';

describe('sumStepTokens', () => {
  describe('正常系', () => {
    it('ステップごとのトークン数を入力と出力で別々に足し合わせる', () => {
      expect(
        sumStepTokens([
          { usage: { inputTokens: 120, outputTokens: 30 } },
          { usage: { inputTokens: 80, outputTokens: 20 } },
        ]),
      ).toStrictEqual({ inputTokens: 200, outputTokens: 50 });
    });
  });

  describe('エッジケース', () => {
    it('終わったステップが無いとき（生成の途中で中断したとき）は不明として null を返す', () => {
      expect(sumStepTokens([])).toStrictEqual({
        inputTokens: null,
        outputTokens: null,
      });
    });

    it('トークン数の無いステップは飛ばし、どのステップにも無い側だけ null にする', () => {
      expect(
        sumStepTokens([
          { usage: { inputTokens: 120, outputTokens: undefined } },
          { usage: { inputTokens: undefined, outputTokens: undefined } },
        ]),
      ).toStrictEqual({ inputTokens: 120, outputTokens: null });
    });

    it('0 トークンは不明ではなく 0 として数える', () => {
      expect(
        sumStepTokens([{ usage: { inputTokens: 0, outputTokens: 0 } }]),
      ).toStrictEqual({ inputTokens: 0, outputTokens: 0 });
    });
  });
});
