import { nextjs } from '@k8o/oxc-config';
import type { OxlintConfig } from 'oxlint';

// vite.config.ts の settings.react.version と揃えて更新する。
// react の version 実行時参照は Next のサーバーバンドルだと canary 表記になり
// (例: 19.2.0-canary-xxx)、oxlint が設定として受け付けないため使えない
const REACT_VERSION = '19.2.7';

// .oxlintrc.json にそのまま書ける形 (extends 解決済み・直列化可能なキーのみ)
export type FlatOxlintrc = Pick<
  OxlintConfig,
  'categories' | 'options' | 'plugins' | 'rules' | 'settings'
>;

const mergeInto = (target: FlatOxlintrc, source: OxlintConfig): void => {
  if (source.plugins) {
    // oxlint は plugins をマージではなく置換で扱うため、後勝ちで丸ごと差し替える
    target.plugins = [...source.plugins];
  }
  if (source.categories) {
    target.categories = { ...target.categories, ...source.categories };
  }
  if (source.rules) {
    target.rules = { ...target.rules, ...source.rules };
  }
  if (source.settings) {
    target.settings = { ...target.settings, ...source.settings };
  }
};

const flattenInto = (target: FlatOxlintrc, config: OxlintConfig): void => {
  for (const parent of config.extends ?? []) {
    flattenInto(target, parent);
  }
  mergeInto(target, config);
};

/**
 * リポジトリの vite.config.ts と同等の lint 設定を、oxlint CLI に渡せる
 * 単一の .oxlintrc.json 相当へフラット化する。
 *
 * vite.config.ts との差分 (Web ツールでは再現しないもの):
 * - tailwind プリセット: JS プラグイン (oxlint-tailwindcss) の実行環境が必要
 * - typeAware: 型情報 lint は tsgolint バイナリと tsconfig が必要。
 *   type-aware ルールが rules に残っても oxlint は黙ってスキップする
 * - settings.next.rootDir / test・d.ts の overrides: 単一の入力ファイルには無関係
 */
export const buildOxlintrc = (): FlatOxlintrc => {
  const flattened: FlatOxlintrc = {};
  flattenInto(flattened, nextjs);
  return {
    ...flattened,
    options: { reportUnusedDisableDirectives: 'error' },
    settings: {
      ...flattened.settings,
      react: { version: REACT_VERSION },
    },
    rules: {
      ...flattened.rules,
      // 以下は vite.config.ts の rules 上書きと揃える
      'import/no-unassigned-import': [
        'error',
        { allow: ['**/*.css', '@/libs/zod', 'react', 'server-only'] },
      ],
      'no-underscore-dangle': 'off',
    },
  };
};
