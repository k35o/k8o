import { tokens } from '@k8ordo/ui/tokens';

type TokenSet = Readonly<Record<string, { readonly $value: unknown }>>;

const isOklch = (
  value: unknown,
): value is { colorSpace: 'oklch'; components: readonly number[] } =>
  typeof value === 'object' &&
  value !== null &&
  'colorSpace' in value &&
  value.colorSpace === 'oklch' &&
  'components' in value &&
  Array.isArray(value.components);

const root: TokenSet = tokens.resolutionOrder[0].sources[0];

const darkModifier = tokens.resolutionOrder.find(
  (entry) => entry.name === '.dark',
);
if (darkModifier?.type !== 'modifier') {
  throw new Error('@k8ordo/ui の tokens に .dark の modifier が無い');
}
const dark: TokenSet = darkModifier.contexts.on[0];

const cssColorOf = (set: TokenSet, name: string): string => {
  const value = set[name]?.$value;
  // 意味のトークンは、{gray-50} の形で :root の色を指す
  if (typeof value === 'string') {
    return cssColorOf(root, value.slice(1, -1));
  }
  if (!isOklch(value)) {
    throw new Error(`${name} が oklch の色ではない`);
  }
  return `oklch(${value.components.join(' ')})`;
};

// meta の theme-color は CSS の変数を読めないので、ページの背景のトークンの値を書く
export const THEME_COLOR = {
  light: cssColorOf(root, 'color-bg-surface'),
  dark: cssColorOf(dark, 'color-bg-surface'),
} as const;
