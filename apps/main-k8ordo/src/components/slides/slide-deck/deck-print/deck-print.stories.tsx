import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { P } from '../../mdx-parts/paragraph/paragraph';
import { DeckPrint } from './deck-print';

const meta = preview.meta({
  title: 'app/slides/slide-deck/deck-print',
  component: DeckPrint,
  args: { slides: [{ content: [<P key="body">1 枚目</P>], notes: [] }] },
});

const pageRulesIn = (rules: CSSRuleList): CSSPageRule[] =>
  [...rules].flatMap((rule) => {
    if (rule instanceof CSSPageRule) return [rule];
    if (rule instanceof CSSGroupingRule) return pageRulesIn(rule.cssRules);
    return [];
  });

const pageRulesInDocument = (): CSSPageRule[] =>
  [...document.styleSheets].flatMap((sheet) => pageRulesIn(sheet.cssRules));

export const PageSizeLeavesWithDeck = meta.story({
  parameters: { vrt: { skip: true } },
  // Story が描いた部品は play の中で外せないので、play で描いて外す
  render: () => <div />,
  play: async ({ args, canvasElement }) => {
    const host = document.createElement('div');
    canvasElement.append(host);
    const root = createRoot(host);
    flushSync(() => {
      root.render(<DeckPrint {...args} />);
    });

    await expect(pageRulesInDocument()).toHaveLength(1);

    root.unmount();

    await expect(pageRulesInDocument()).toEqual([]);
  },
});
