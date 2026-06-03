// 同時実行数を concurrency 以下に制限しつつ、入力順で結果を返す（ワーカープール方式）
export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = Array.from<R>({ length: items.length });
  let cursor = 0;

  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (item !== undefined) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- ワーカープールでは各ワーカーが逐次 await することで同時実行数を制限する
        results[index] = await fn(item, index);
      }
    }
  };

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  const workers: Array<Promise<void>> = [];
  for (let i = 0; i < workerCount; i += 1) {
    workers.push(worker());
  }
  await Promise.all(workers);

  return results;
};

if (import.meta.vitest) {
  describe('mapWithConcurrency', () => {
    describe('正常系', () => {
      it('入力と同じ順序で結果を返す', async () => {
        const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, (n) =>
          Promise.resolve(n * 2),
        );
        expect(result).toEqual([2, 4, 6, 8, 10]);
      });

      it('index を渡す', async () => {
        const result = await mapWithConcurrency(['a', 'b', 'c'], 2, (_, i) =>
          Promise.resolve(i),
        );
        expect(result).toEqual([0, 1, 2]);
      });

      it('同時実行数が concurrency を超えない', async () => {
        let active = 0;
        let maxActive = 0;
        await mapWithConcurrency(
          [1, 2, 3, 4, 5, 6],
          2,
          async (n): Promise<number> => {
            active += 1;
            maxActive = Math.max(maxActive, active);
            await Promise.resolve();
            active -= 1;
            return n;
          },
        );
        expect(maxActive).toBeLessThanOrEqual(2);
      });
    });

    describe('エッジケース', () => {
      it('空配列なら空配列を返す', async () => {
        const result = await mapWithConcurrency([], 3, () =>
          Promise.resolve(1),
        );
        expect(result).toEqual([]);
      });

      it('concurrency が要素数より大きくても全要素を処理する', async () => {
        const result = await mapWithConcurrency([1, 2], 10, (n) =>
          Promise.resolve(n + 1),
        );
        expect(result).toEqual([2, 3]);
      });
    });
  });
}
