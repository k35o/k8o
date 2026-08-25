export type AppSrcPath = {
  app: string;
  rel: string;
};

// 最後の `apps/<app>/src/` を基準にするため貪欲マッチにする
// （リポジトリの配置場所やテストfixtureのパスに同名セグメントが含まれても壊れない）。
const APP_SRC_PATTERN = /^.*\/apps\/([^/]+)\/src\/(.+)$/u;

export const parseAppSrcPath = (filename: string): AppSrcPath | null => {
  const match = APP_SRC_PATTERN.exec(filename.replaceAll('\\', '/'));
  if (!match) {
    return null;
  }
  const [, app, rel] = match;
  if (app === undefined || rel === undefined) {
    return null;
  }
  return { app, rel };
};
