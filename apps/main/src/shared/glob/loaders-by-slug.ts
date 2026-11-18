// import.meta.glob の結果を、ファイル名の slug（pattern の 1 つ目のグループ）から引ける形にする
export const loadersBySlug = <T>(
  modules: Record<string, () => Promise<T>>,
  pattern: RegExp,
): Map<string, () => Promise<T>> =>
  new Map(
    Object.entries(modules).flatMap(([file, load]) => {
      const slug = pattern.exec(file)?.[1];
      return slug === undefined ? [] : [[slug, load] as const];
    }),
  );
