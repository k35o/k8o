import type { PdfBlock, PdfLine, PdfTextTag } from './pdf-deck.ts';

// pdfjs-dist の getTextContent({ includeMarkedContent: true }) の items の、使う分だけの形
export type PdfTextContentItem =
  | { str: string; transform: number[]; width: number }
  | { type: string; id?: string };

// pdfjs-dist の getStructTree の、使う分だけの形
export type PdfStructNode = {
  role?: string;
  alt?: string;
  type?: string;
  id?: string;
  children?: PdfStructNode[];
};

type Run = {
  id: string | undefined;
  text: string;
  x: number;
  y: number;
  width: number;
  size: number;
};

type Part = { tag: 'img'; alt: string } | { tag: PdfTextTag; runs: Run[] };

const TAG_OF_ROLE = new Map<string, PdfTextTag>([
  ['H1', 'h1'],
  ['H2', 'h2'],
  ['H3', 'h3'],
  ['H4', 'h4'],
  ['H5', 'h5'],
  ['H6', 'h6'],
  ['P', 'p'],
  ['LI', 'p'],
  ['TD', 'p'],
  ['TH', 'p'],
  ['Caption', 'p'],
]);

const BASELINE_FROM_TOP = 0.88;

const readRuns = (
  items: readonly PdfTextContentItem[],
  view: readonly number[],
): Run[] => {
  const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = view;
  const open: Array<string | undefined> = [];
  const runs: Run[] = [];
  for (const item of items) {
    if ('str' in item) {
      const [, , c = 0, d = 0, x = 0, y = 0] = item.transform;
      const isOnPage = x >= x0 && x < x1 && y >= y0 && y < y1;
      if (item.str !== '' && isOnPage) {
        runs.push({
          id: open.findLast((id) => id !== undefined),
          text: item.str,
          x,
          y,
          width: item.width,
          size: Math.hypot(c, d),
        });
      }
    } else if (item.type === 'endMarkedContent') {
      open.pop();
    } else {
      open.push(item.id);
    }
  }
  return runs;
};

const paragraphsByLeading = (runs: readonly Run[]): Run[][] => {
  const paragraphs: Run[][] = [];
  let paragraph: Run[] = [];
  let previous: Run | undefined;
  for (const run of runs) {
    if (run.text.trim() !== '') {
      if (previous !== undefined) {
        const down = previous.y - run.y;
        const isSameSize =
          Math.abs(previous.size - run.size) <= previous.size * 0.2;
        const isSameLine =
          Math.abs(down) <= previous.size * 0.3 &&
          run.x - (previous.x + previous.width) <= previous.size;
        const isNextLine = down > 0 && down <= previous.size * 1.8;
        if (!isSameSize || (!isSameLine && !isNextLine)) {
          paragraphs.push(paragraph);
          paragraph = [];
        }
      }
      previous = run;
    }
    paragraph.push(run);
  }
  paragraphs.push(paragraph);
  return paragraphs;
};

const partsInReadingOrder = (
  tree: PdfStructNode | null,
  runs: readonly Run[],
): Part[] => {
  const untagged = new Set(runs);
  const parts: Part[] = [];
  const visit = (node: PdfStructNode, owner: Run[] | null): void => {
    if (node.type === 'content') {
      const found = runs.filter(
        (run) => run.id !== undefined && run.id === node.id,
      );
      for (const run of found) untagged.delete(run);
      if (owner === null) parts.push({ tag: 'p', runs: found });
      else owner.push(...found);
      return;
    }
    if (node.role === 'Figure' && node.alt) {
      parts.push({ tag: 'img', alt: node.alt });
    }
    const tag = TAG_OF_ROLE.get(node.role ?? '');
    let target = owner;
    if (tag !== undefined) {
      target = [];
      parts.push({ tag, runs: target });
    }
    for (const child of node.children ?? []) visit(child, target);
  };
  if (tree !== null) visit(tree, null);
  for (const paragraph of paragraphsByLeading([...untagged])) {
    parts.push({ tag: 'p', runs: paragraph });
  }
  return parts;
};

const joinLines = (runs: readonly Run[]): Run[] => {
  const lines: Run[] = [];
  let hasSpace = false;
  for (const run of runs) {
    const text = run.text.trim();
    if (text === '') {
      hasSpace = true;
      continue;
    }
    const line = lines.at(-1);
    const gap = line === undefined ? 0 : run.x - (line.x + line.width);
    if (
      line !== undefined &&
      Math.abs(line.y - run.y) <= line.size * 0.3 &&
      Math.abs(gap) <= line.size
    ) {
      const isSpaced =
        hasSpace || /^\s/u.test(run.text) || gap > line.size * 0.2;
      line.text += `${isSpaced ? ' ' : ''}${text}`;
      line.width = run.x + run.width - line.x;
      line.size = Math.max(line.size, run.size);
    } else {
      lines.push({ ...run, text });
    }
    hasSpace = /\s$/u.test(run.text);
  }
  return lines;
};

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const round = (value: number): number => Math.round(value * 1e5) / 1e5;

// PDF の 1 ページの文字を、読み上げる順の見出し・段落・図と、行ごとの位置（ページに対する割合）にする
export const extractPageBlocks = ({
  view,
  items,
  tree,
}: {
  view: readonly number[];
  items: readonly PdfTextContentItem[];
  tree: PdfStructNode | null;
}): PdfBlock[] => {
  const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = view;
  const pageWidth = x1 - x0;
  const pageHeight = y1 - y0;
  const toLine = ({ text, x, y, width, size }: Run): PdfLine => {
    const left = clamp((x - x0) / pageWidth);
    return {
      text,
      left: round(left),
      top: round(clamp((y1 - y - size * BASELINE_FROM_TOP) / pageHeight)),
      width: round(Math.min(1 - left, width / pageWidth)),
      height: round(clamp(size / pageHeight)),
    };
  };
  return partsInReadingOrder(tree, readRuns(items, view)).flatMap(
    (part): PdfBlock[] => {
      if (part.tag === 'img') return [part];
      const lines = joinLines(part.runs).map(toLine);
      return lines.length === 0 ? [] : [{ tag: part.tag, lines }];
    },
  );
};
