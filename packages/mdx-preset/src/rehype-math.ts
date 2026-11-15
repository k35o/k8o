import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import temml from 'temml';
import { SKIP, visit } from 'unist-util-visit';

// remark-math が出す数式の要素を、Temml で MathML に置き換える rehype プラグイン

// unified が渡す VFile の message の型に収まるよう、cause は Error に絞る
type MessageSink = {
  message: (reason: string, options: { cause: Error | undefined }) => unknown;
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

const renderToMathml = (
  { value, displayMode }: MathSource,
  file: MessageSink,
): string => {
  try {
    return temml.renderToString(value, { displayMode, throwOnError: true });
  } catch (error) {
    // 数式の誤りではビルドを止めず、警告を出して Temml のエラー表示で描く
    file.message('Temml で数式を描画できない', {
      cause: error instanceof Error ? error : undefined,
    });
    return temml.renderToString(value, { displayMode, throwOnError: false });
  }
};

// Temml の出力は要素とテキストだけからなる
const isRenderedContent = (node: RootContent): node is Element | Text =>
  node.type === 'element' || node.type === 'text';

// 別行の数式は狭い画面で横にスクロールする。math 要素は Safari と Firefox ではスクロールの箱に
// ならないので、外側に箱を置く。中に操作できる要素の無いスクロールの箱は、Safari ではキーボードで
// 届かないので、Tab で止まれるようにする
const scrollBox = (children: ElementContent[]): Element => ({
  type: 'element',
  tagName: 'div',
  properties: { className: ['math-scroll'], tabIndex: 0 },
  children,
});

const render = (source: MathSource, file: MessageSink): ElementContent[] => {
  const rendered = fromHtmlIsomorphic(renderToMathml(source, file), {
    fragment: true,
  }).children.filter(isRenderedContent);
  return source.displayMode ? [scrollBox(rendered)] : rendered;
};

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
