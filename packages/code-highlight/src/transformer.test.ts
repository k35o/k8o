import type { Element, ElementContent, Root } from 'hast';
import { codeToHast } from 'shiki';
import { describe, expect, it } from 'vitest';

import { annotateTransformer } from './transformer.ts';

const toHast = (code: string, meta?: string, lang = 'js') =>
  codeToHast(code, {
    lang,
    theme: 'plastic',
    transformers: [annotateTransformer()],
    ...(meta === undefined ? {} : { meta: { __raw: meta } }),
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

const codeElements = (tree: Root): Element[] => {
  const wrapper = tree.children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'div',
  );
  const pre = wrapper && findElement(wrapper.children, 'pre');
  const code = pre && findElement(pre.children, 'code');
  return code ? code.children.filter(isElement) : [];
};

const textOf = (node: ElementContent | undefined): string => {
  if (node === undefined) return '';
  if (node.type === 'text') return node.value;
  if (node.type !== 'element') return '';
  return node.children.map((child) => textOf(child)).join('');
};

const wrapperElement = (tree: Root): Element | undefined =>
  tree.children.find(
    (child): child is Element =>
      child.type === 'element' && child.tagName === 'div',
  );

const preElement = (tree: Root): Element | undefined => {
  const wrapper = wrapperElement(tree);
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

    it('メタの title="..." を data-filename として pre 要素に付与する', async () => {
      const tree = await toHast('const x = 1;', 'title="foo.ts"');

      expect(preElement(tree)?.properties['data-filename']).toBe('foo.ts');
    });

    it("シングルクォートの title='...' も data-filename として扱う", async () => {
      const tree = await toHast('const x = 1;', "title='bar/baz.tsx'");

      expect(preElement(tree)?.properties['data-filename']).toBe('bar/baz.tsx');
    });

    it('ラッパーに言語を data-label として付与する', async () => {
      const tree = await toHast('const x = 1;');

      expect(wrapperElement(tree)?.properties['data-label']).toBe('js');
    });

    it('ファイル名があれば言語より優先して data-label にする', async () => {
      const tree = await toHast('const x = 1;', 'title="foo.ts"');

      expect(wrapperElement(tree)?.properties['data-label']).toBe('foo.ts');
    });

    it('メタの demo="..." をラッパーの data-demo にする', async () => {
      const tree = await toHast('<p></p>', 'demo="dots"', 'html');

      expect(wrapperElement(tree)?.properties['data-demo']).toBe('dots');
    });

    it('メタの allow="..." をラッパーの data-demo-allow にする', async () => {
      const tree = await toHast(
        'await navigator.clipboard.readText();',
        'demo="copy" allow="clipboard-read clipboard-write"',
        'js',
      );

      expect(wrapperElement(tree)?.properties['data-demo-allow']).toBe(
        'clipboard-read clipboard-write',
      );
    });

    it('メタの selected をラッパーの data-selected にする', async () => {
      const tree = await toHast('draw();', 'demo="dots" selected', 'js');

      expect(wrapperElement(tree)?.properties['data-selected']).toBe('');
    });

    it('引用符の中の selected は目印として扱わない', async () => {
      const tree = await toHast('const x = 1;', 'title="selected item.ts"');

      expect(wrapperElement(tree)?.properties['data-selected']).toBeUndefined();
    });

    it('動く例の [!fold] の範囲を span に包み、その前に読み上げない「⋯」の印を置く', async () => {
      const tree = await toHast(
        ['a();', '// [!fold]', 'b();', 'c();', '// [!fold-end]', 'd();'].join(
          '\n',
        ),
        'demo="dots"',
      );
      const [first, mark, fold, last] = codeElements(tree);

      expect(textOf(first)).toBe('a();');
      expect(classListOf(mark)).toStrictEqual(['code-annotate-fold-mark']);
      expect(mark?.properties.ariaHidden).toBe('true');
      expect(textOf(mark)).toBe('⋯');
      expect(classListOf(fold)).toStrictEqual(['code-annotate-fold']);
      expect(
        fold?.children.filter(isElement).map((line) => textOf(line)),
      ).toStrictEqual(['b();', 'c();']);
      expect(textOf(last)).toBe('d();');
    });

    it('畳む行に付いたコールアウトの行も、畳む範囲に入れる', async () => {
      const tree = await toHast(
        [
          '// [!fold]',
          '// [!callout: 飾り]',
          'a();',
          '// [!fold-end]',
          'b();',
        ].join('\n'),
        'demo="dots"',
      );
      const [, fold, last] = codeElements(tree);

      expect(
        fold?.children.filter(isElement).map((line) => classListOf(line)),
      ).toStrictEqual([
        ['line', 'code-annotate-has-callout'],
        ['line', 'code-annotate-callout-line'],
      ]);
      expect(textOf(last)).toBe('b();');
    });
  });

  describe('異常系', () => {
    it('動く例でないコードブロックの [!fold] は、省いた行を見る手段が無いので投げる', async () => {
      await expect(
        toHast(['// [!fold]', 'a();', '// [!fold-end]'].join('\n')),
      ).rejects.toThrow(/demo=/u);
    });
  });

  describe('エッジケース', () => {
    it('注釈なしのコードに対してもエラーにならない', async () => {
      const tree = await toHast('const x = 1;');
      expect(lineElements(tree)).toHaveLength(1);
    });

    it('title を含まないメタでは data-filename を付与しない', async () => {
      const tree = await toHast('const x = 1;', 'showLineNumbers');

      expect(preElement(tree)?.properties['data-filename']).toBeUndefined();
    });

    it('text の言語でファイル名も無ければ data-label を付与しない', async () => {
      const tree = await toHast('plain', undefined, 'text');

      expect(wrapperElement(tree)?.properties['data-label']).toBeUndefined();
    });

    it('畳むだけのブロックには、注釈の gutter を空ける data-annotated を付けない', async () => {
      const tree = await toHast(
        ['// [!fold]', 'a();', '// [!fold-end]'].join('\n'),
        'demo="dots"',
      );

      expect(
        wrapperElement(tree)?.properties['data-annotated'],
      ).toBeUndefined();
    });

    it('最後の行まで畳んでも、印と畳む span を置く', async () => {
      const tree = await toHast(
        ['a();', '// [!fold]', 'b();', '// [!fold-end]'].join('\n'),
        'demo="dots"',
      );

      expect(
        codeElements(tree).map((element) => classListOf(element)[0]),
      ).toStrictEqual([
        'line',
        'code-annotate-fold-mark',
        'code-annotate-fold',
      ]);
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
