import type { Element, ElementContent, Root } from 'hast';
import { codeToHast } from 'shiki';

import { annotateTransformer } from './transformer.ts';

const toHast = (code: string) =>
  codeToHast(code, {
    lang: 'js',
    theme: 'plastic',
    transformers: [annotateTransformer()],
  });

const isElement = (node: ElementContent | undefined): node is Element =>
  node?.type === 'element';

const findElement = (
  children: readonly ElementContent[],
  tagName: string,
): Element | undefined =>
  children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === tagName,
  );

const lineElements = (tree: Root): Element[] => {
  const wrapper = tree.children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'div',
  );
  const pre = wrapper && findElement(wrapper.children, 'pre');
  const code = pre && findElement(pre.children, 'code');
  if (!code) return [];
  return code.children.filter(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'span',
  );
};

const preElement = (tree: Root): Element | undefined => {
  const wrapper = tree.children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'div',
  );
  return wrapper && findElement(wrapper.children, 'pre');
};

const classListOf = (node: Element | undefined): string[] => {
  if (!node) return [];
  const raw = node.properties['class'];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') return raw.split(/\s+/u).filter(Boolean);
  return [];
};

const calloutTextOf = (
  calloutLine: Element | undefined,
): string | undefined => {
  if (!calloutLine) return undefined;
  const textNode = calloutLine.children.find(
    (child): child is Element =>
      isElement(child) &&
      classListOf(child).includes('code-annotate-callout-text'),
  );
  const first = textNode?.children[0];
  return first?.type === 'text' ? first.value : undefined;
};

describe('annotateTransformer', () => {
  describe('正常系', () => {
    it('// [!hl] の次の行にハイライトクラスを付与し、ディレクティブ行はコードから削除する', async () => {
      const tree = await toHast(['// [!hl]', 'const x = 1;'].join('\n'));
      const lines = lineElements(tree);

      expect(lines).toHaveLength(1);
      expect(classListOf(lines[0])).toContain('code-annotate-highlight');
    });

    it('// [!callout: テキスト] は対象行直後に別行としてコールアウトを描画する', async () => {
      const tree = await toHast(
        ['// [!callout: 重要な行]', 'const x = 1;'].join('\n'),
      );
      const lines = lineElements(tree);

      expect(classListOf(lines[0])).toContain('code-annotate-has-callout');
      const calloutLine = lines[1];
      expect(classListOf(calloutLine)).toContain('code-annotate-callout-line');
      expect(calloutTextOf(calloutLine)).toBe('重要な行');
    });

    it('// [!+] と // [!-] が次の行に add/remove のクラスを付与する', async () => {
      const tree = await toHast(
        ['// [!+]', 'const added = 1;', '// [!-]', 'const removed = 2;'].join(
          '\n',
        ),
      );
      const lines = lineElements(tree);

      expect(lines).toHaveLength(2);
      expect(classListOf(lines[0])).toContain('code-annotate-add');
      expect(classListOf(lines[1])).toContain('code-annotate-remove');
    });

    it('指示が付かない行にはクラスを付与しない', async () => {
      const tree = await toHast(
        ['// [!hl]', 'const x = 1;', 'const y = 2;'].join('\n'),
      );
      const lines = lineElements(tree);

      expect(classListOf(lines[1])).not.toContain('code-annotate-highlight');
    });

    it('pre 要素に言語を data-lang として付与する', async () => {
      const tree = await toHast('const x = 1;');

      expect(preElement(tree)?.properties['data-lang']).toBe('js');
    });
  });

  describe('エッジケース', () => {
    it('注釈なしのコードに対してもエラーにならない', async () => {
      const tree = await toHast('const x = 1;');
      expect(lineElements(tree)).toHaveLength(1);
    });

    it('複数の連続指示が同じ対象行に重ねて適用される', async () => {
      const tree = await toHast(
        ['// [!hl]', '// [!callout: 注目]', 'const x = 1;'].join('\n'),
      );
      const lines = lineElements(tree);
      const targetClasses = classListOf(lines[0]);

      expect(targetClasses).toContain('code-annotate-highlight');
      expect(targetClasses).toContain('code-annotate-has-callout');
      expect(calloutTextOf(lines[1])).toBe('注目');
    });
  });
});
