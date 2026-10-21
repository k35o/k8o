import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import katex from 'katex';
import { SKIP, visit } from 'unist-util-visit';

// remark-math が出す数式の要素を KaTeX の HTML に置き換える MDX の rehype プラグイン。
// 記事は apps/main の katex の CSS を読むので、HTML も同じ katex で作る。rehype-katex は
// katex ^0.16 を固定し、0.18 でクラス名が変わった CSS と合わなくなっていた

type MessageSink = {
  message: (reason: string, options: { cause: unknown }) => unknown;
};

type MathSource = { value: string; displayMode: boolean };

const hasClass = (element: Element, name: string): boolean => {
  const { className } = element.properties;
  return Array.isArray(className) && className.includes(name);
};

const textOf = (node: ElementContent): string => {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.type === 'element') {
    return node.children.map(textOf).join('');
  }
  return '';
};

const isMathCode = (node: ElementContent | undefined): node is Element =>
  node?.type === 'element' &&
  node.tagName === 'code' &&
  hasClass(node, 'language-math');

// remark-math はインラインを <code class="language-math math-inline">、ブロックを
// <pre><code class="language-math math-display"> にする。```math のコードブロックも
// <pre><code class="language-math"> になるので、ブロックとして扱う
const toMathSource = (element: Element): MathSource | undefined => {
  if (element.tagName === 'pre') {
    const [code, ...rest] = element.children;
    return isMathCode(code) && rest.length === 0
      ? { value: textOf(code), displayMode: true }
      : undefined;
  }
  return isMathCode(element)
    ? { value: textOf(element), displayMode: hasClass(element, 'math-display') }
    : undefined;
};

const renderToHtml = (
  { value, displayMode }: MathSource,
  file: MessageSink,
): string => {
  try {
    return katex.renderToString(value, { displayMode, throwOnError: true });
  } catch (error) {
    // 数式の誤りではビルドを止めず、警告を出して KaTeX のエラー表示で描く
    file.message('KaTeX で数式を描画できない', { cause: error });
    return katex.renderToString(value, { displayMode, throwOnError: false });
  }
};

// KaTeX の HTML は要素とテキストだけからなる
const isRenderedContent = (node: RootContent): node is Element | Text =>
  node.type === 'element' || node.type === 'text';

const render = (source: MathSource, file: MessageSink): ElementContent[] =>
  fromHtmlIsomorphic(renderToHtml(source, file), {
    fragment: true,
  }).children.filter(isRenderedContent);

export default function rehypeMath(): (tree: Root, file: MessageSink) => void {
  return (tree, file) => {
    visit(tree, 'element', (element, index, parent) => {
      const source = toMathSource(element);
      if (source === undefined || parent === undefined || index === undefined) {
        return undefined;
      }
      const rendered = render(source, file);
      parent.children.splice(index, 1, ...rendered);
      return [SKIP, index + rendered.length];
    });
  };
}
