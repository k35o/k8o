import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { DeckHighlight } from '@/features/share/interface/queries';
import { stripNotes } from '@/features/slides/application/parse-deck';

import preview from '../../../../../../.storybook/preview';
import { SharedDeck } from './shared-deck';

import styles from './shared-deck.stories.module.css';

const DECK = [
  '<Cover>',
  '# 公開したスライド',
  '</Cover>',
  '<Notes>',
  '聞き手に見せないメモ',
  '</Notes>',
  '',
  '---',
  '',
  '## コードの見た目',
  '',
  '```ts',
  'const shared = true;',
  '```',
  '',
  '```bash',
  'echo plain',
  '```',
].join('\n');

const LIGHT_COLOR = '#0b5394';
const DARK_COLOR = '#e6edf3';

const tokensOf = (code: string, theme: 'light' | 'dark'): HighlightedCode => ({
  tokens: [
    [
      {
        content: code,
        offset: 0,
        color: theme === 'light' ? LIGHT_COLOR : DARK_COLOR,
      },
    ],
  ],
  fg: theme === 'light' ? '#24292e' : '#abb2bf',
  bg: theme === 'light' ? '#ffffff' : '#282c34',
});

const highlightOf = (lang: string, code: string): DeckHighlight => ({
  lang,
  code,
  light: tokensOf(code, 'light'),
  dark: tokensOf(code, 'dark'),
});

// デッキに無いブロックを先頭に置き、bash のブロックは載せない。並び順で当てると、ts の位置に別のコードが出る
const HIGHLIGHTS: DeckHighlight[] = [
  highlightOf('ts', 'const stale = false;'),
  highlightOf('ts', 'const shared = true;'),
];

const meta = preview.meta({
  component: SharedDeck,
  // Stage は 16:9 をコンテナクエリで決めるため、枠の高さを固定して描画する。
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    // 公開ページには、サーバーでノートを外したデッキが届く
    source: stripNotes(DECK),
    highlights: HIGHLIGHTS,
  },
});

const showCodeSlide = async (canvasElement: HTMLElement): Promise<void> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
  await expect(
    await canvas.findByRole('heading', { level: 2, name: 'コードの見た目' }),
  ).toBeInTheDocument();
};

export const Light = meta.story({
  parameters: { theme: 'light' },
  play: async ({ canvasElement }) => {
    await showCodeSlide(canvasElement);
    await waitFor(async () => {
      await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: LIGHT_COLOR,
      });
    });
  },
});

export const Dark = meta.story({
  parameters: { theme: 'dark' },
  play: async ({ canvasElement }) => {
    await showCodeSlide(canvasElement);
    await waitFor(async () => {
      await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: DARK_COLOR,
      });
    });
  },
});

// 載っていないブロックはプレーンで描き、ほかのブロックのコードを出さない
export const MissingHighlight = meta.story({
  play: async ({ canvasElement }) => {
    await showCodeSlide(canvasElement);
    await waitFor(async () => {
      await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: LIGHT_COLOR,
      });
    });
    const [ts, bash] = canvasElement.querySelectorAll('pre');
    await expect(ts).toHaveTextContent('const shared = true;');
    await expect(bash).toHaveTextContent('echo plain');
    await expect(bash?.querySelector('code span')).toBeNull();
    await expect(document.body).not.toHaveTextContent('const stale = false;');
  },
});

// 発表者ノートは画面にも、印刷用のスライドにも出ない
export const WithoutNotes = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: '公開したスライド' }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('region', { name: '発表者ノート' }),
    ).toBeNull();
    await expect(
      document.body.querySelector('[data-slide-print]')?.children,
    ).toHaveLength(2);
    await expect(document.body).not.toHaveTextContent('聞き手に見せないメモ');
  },
});
