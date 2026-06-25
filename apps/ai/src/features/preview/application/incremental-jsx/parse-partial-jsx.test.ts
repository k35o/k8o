import { extractJsxBody, parsePartialJsx } from './parse-partial-jsx';
import type { JsxElement, JsxNode } from './types';

const firstElement = (nodes: readonly JsxNode[]): JsxElement => {
  for (const node of nodes) {
    if (node.type === 'element') {
      return node;
    }
  }
  throw new Error('element ノードが見つかりません');
};

describe('parsePartialJsx', () => {
  describe('正常系', () => {
    it('単一要素の className とテキスト子をパースする', () => {
      // Arrange
      const source = '<div className="box">Hello</div>';

      // Act
      const el = firstElement(parsePartialJsx(source));

      // Assert
      expect(el.name).toBe('div');
      expect(el.props).toEqual([
        { name: 'className', value: { kind: 'string', value: 'box' } },
      ]);
      expect(el.children).toEqual([{ type: 'text', value: 'Hello' }]);
    });

    it('コンポーネントのネストと文字列属性をパースする', () => {
      // Arrange
      const source =
        '<Card appearance="shadow"><Heading type="h2">Title</Heading></Card>';

      // Act
      const card = firstElement(parsePartialJsx(source));
      const heading = firstElement(card.children);

      // Assert
      expect(card.name).toBe('Card');
      expect(heading.name).toBe('Heading');
      expect(heading.props).toEqual([
        { name: 'type', value: { kind: 'string', value: 'h2' } },
      ]);
      expect(heading.children).toEqual([{ type: 'text', value: 'Title' }]);
    });

    it('自己終了タグと数値リテラル属性をパースする', () => {
      // Arrange
      const source = '<Grid cols={2} gap="md" />';

      // Act
      const el = firstElement(parsePartialJsx(source));

      // Assert
      expect(el.children).toEqual([]);
      expect(el.props).toEqual([
        { name: 'cols', value: { kind: 'literal', value: 2 } },
        { name: 'gap', value: { kind: 'string', value: 'md' } },
      ]);
    });

    it('prop に渡したネスト JSX（アイコン）を element として保持する', () => {
      // Arrange
      const source = '<Button startIcon={<SparklesIcon />}>送信</Button>';

      // Act
      const el = firstElement(parsePartialJsx(source));

      // Assert
      expect(el.props).toEqual([
        {
          name: 'startIcon',
          value: {
            kind: 'element',
            value: {
              type: 'element',
              name: 'SparklesIcon',
              props: [],
              children: [],
            },
          },
        },
      ]);
    });

    it('真偽値短縮属性を boolean として扱う', () => {
      // Arrange
      const source = '<button disabled>x</button>';

      // Act
      const el = firstElement(parsePartialJsx(source));

      // Assert
      expect(el.props).toEqual([
        { name: 'disabled', value: { kind: 'boolean' } },
      ]);
    });
  });

  describe('異常系（ストリーミング途中）', () => {
    it('開始タグが途中で切れたら親の子を pending にする', () => {
      // Arrange
      const source = '<div><Card appea';

      // Act
      const div = firstElement(parsePartialJsx(source));

      // Assert
      expect(div.children).toEqual([{ type: 'pending' }]);
    });

    it('子テキストの途中で切れたら末尾に pending を足す', () => {
      // Arrange
      const source = '<div className="x">Hello';

      // Act
      const div = firstElement(parsePartialJsx(source));

      // Assert
      expect(div.children).toEqual([
        { type: 'text', value: 'Hello' },
        { type: 'pending' },
      ]);
    });

    it('文字列属性が閉じ未到達なら pending のみを返す', () => {
      // Arrange
      const source = '<div className="bo';

      // Act
      const nodes = parsePartialJsx(source);

      // Assert
      expect(nodes).toEqual([{ type: 'pending' }]);
    });
  });

  describe('エッジケース', () => {
    it('未対応の式（.map）は子として描かない', () => {
      // Arrange
      const source = '<ul>{items.map((i) => <li>{i}</li>)}</ul>';

      // Act
      const ul = firstElement(parsePartialJsx(source));

      // Assert
      expect(ul.children).toEqual([]);
    });

    it('フラグメントを名前なし要素としてパースする', () => {
      // Arrange
      const source = '<><span>a</span></>';

      // Act
      const fragment = firstElement(parsePartialJsx(source));

      // Assert
      expect(fragment.name).toBe('');
      expect(firstElement(fragment.children).name).toBe('span');
    });
  });
});

describe('extractJsxBody', () => {
  describe('正常系', () => {
    it('return より後の最初の < から本体を切り出す', () => {
      // Arrange
      const tsx =
        'export default function Preview() {\n  return (\n    <div>hi</div>\n  );\n}';

      // Act
      const body = extractJsxBody(tsx);

      // Assert
      expect(body.startsWith('<div>hi</div>')).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('return 未到達（import 中）なら空文字を返す', () => {
      // Arrange
      const tsx =
        "import { Card } from '@k8o/arte-odyssey';\n\nexport default function Preview() {";

      // Act & Assert
      expect(extractJsxBody(tsx)).toBe('');
    });
  });
});
