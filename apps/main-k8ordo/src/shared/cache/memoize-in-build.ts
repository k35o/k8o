/**
 * ビルドが読んだ値を、引数ごとにモジュールへ覚える。ビルドはページを HTML とペイロードで
 * 2回描き、React の cache() はその2回をまたがないので、覚えないと同じ DB とファイルを
 * 2回読む。vite dev はモジュールが生きているあいだ覚えた値を返し続け、記事を直しても
 * 描き直されないので、覚えない
 */
export const memoizeInBuild = <
  Args extends ReadonlyArray<string | number>,
  Value,
>(
  load: (...args: Args) => Promise<Value>,
): ((...args: Args) => Promise<Value>) => {
  const loading = new Map<string, Promise<Value>>();
  return (...args) => {
    if (import.meta.env.DEV) {
      return load(...args);
    }
    const key = JSON.stringify(args);
    const memoized = loading.get(key);
    if (memoized !== undefined) {
      return memoized;
    }
    const promise = load(...args);
    loading.set(key, promise);
    return promise;
  };
};
