/**
 * ビルドが読んだ値を、引数ごとにモジュールへ覚える。ビルドは 1 つのプロセスですべてのページと
 * route.ts を描き、React の cache() はページをまたがないので、覚えないと、どのページも読む一覧
 * （記事・タグなど）をページの数だけ DB とファイルから読む。vite dev はモジュールが生きている
 * あいだ覚えた値を返し続け、記事を直しても描き直されないので、覚えない
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
