import { diffBaseline, readBaselineFeatures } from './sync-baseline';
import type { BaselineFeature } from './sync-baseline';

// sync-baseline.ts の import { db } で実 DB クライアントが生成されないようモックする。
// 本テストは db を呼ばない純粋関数と実データのみを検証する。
vi.mock('@repo/database', () => ({ db: {} }));

const feature = (
  featureId: string,
  status: 'newly' | 'widely',
  date = '2026-01-01',
): BaselineFeature => ({ featureId, name: featureId, status, date });

describe('diffBaseline', () => {
  describe('正常系', () => {
    it('既存に無い機能は newFeatures / toInsert に入る', () => {
      const plan = diffBaseline([feature('a', 'newly')], []);
      expect(plan.newFeatures.map((f) => f.featureId)).toStrictEqual(['a']);
      expect(plan.toInsert.map((f) => f.featureId)).toStrictEqual(['a']);
      expect(plan.statusChanges).toStrictEqual([]);
      expect(plan.toUpdate).toStrictEqual([]);
    });

    it('status が変わった機能は statusChanges / toUpdate に入る', () => {
      const plan = diffBaseline(
        [feature('a', 'widely')],
        [{ featureId: 'a', status: 'newly' }],
      );
      expect(plan.statusChanges).toStrictEqual([
        { feature: feature('a', 'widely'), previousStatus: 'newly' },
      ]);
      expect(plan.toUpdate.map((f) => f.featureId)).toStrictEqual(['a']);
      expect(plan.newFeatures).toStrictEqual([]);
    });
  });

  describe('異常系・エッジケース', () => {
    it('status が同じなら差分なし', () => {
      const plan = diffBaseline(
        [feature('a', 'newly')],
        [{ featureId: 'a', status: 'newly' }],
      );
      expect(plan.newFeatures).toStrictEqual([]);
      expect(plan.statusChanges).toStrictEqual([]);
      expect(plan.toInsert).toStrictEqual([]);
      expect(plan.toUpdate).toStrictEqual([]);
    });

    it('現在集合が空なら何も変更しない', () => {
      const plan = diffBaseline([], [{ featureId: 'a', status: 'newly' }]);
      expect(plan.toInsert).toStrictEqual([]);
      expect(plan.toUpdate).toStrictEqual([]);
      expect(plan.newFeatures).toStrictEqual([]);
      expect(plan.statusChanges).toStrictEqual([]);
    });
  });
});

describe('readBaselineFeatures（実データ）', () => {
  it('baseline(newly/widely)のみを返し、日付は YYYY-MM-DD', () => {
    const features = readBaselineFeatures();
    expect(features.length).toBeGreaterThan(0);
    for (const f of features) {
      expect(['newly', 'widely']).toContain(f.status);
      expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    }
  });
});
