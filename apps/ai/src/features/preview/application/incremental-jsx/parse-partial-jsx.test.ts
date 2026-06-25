import {
  extractJsxBody,
  parsePartialJsx,
  parseStreamingTsx,
} from './parse-partial-jsx';
import type { JsxElement, JsxNode } from './types';

const firstElement = (nodes: readonly JsxNode[]): JsxElement => {
  for (const node of nodes) {
    if (node.type === 'element') {
      return node;
    }
  }
  throw new Error('element ノードが見つかりません');
};

// 要素配下のテキストを連結して取り出す（map 展開の解決結果を検証する用）。
const textOf = (node: JsxNode): string => {
  if (node.type === 'element') {
    return node.children.map(textOf).join('');
  }
  return node.type === 'text' ? node.value : '';
};

// ノードの種別ラベル（要素なら名前、それ以外は type）。テスト内で条件分岐を書かないための補助。
const labelOf = (node: JsxNode): string =>
  node.type === 'element' ? node.name : node.type;

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

    it('連結式は単一リテラルでないので中身をテキストに漏らさない', () => {
      // Arrange: 先頭と末尾がクォートでも `'a' + 'b'` は文字列リテラルではない。
      const source = "<p>{'前半 ' + x + ' 後半'}</p>";

      // Act
      const p = firstElement(parsePartialJsx(source));

      // Assert: コード片（"前半 ' + x + ' 後半"）がそのまま描かれない。
      expect(p.children).toEqual([]);
    });

    it('単一の文字列/数値リテラルはそのまま値として扱う', () => {
      // Arrange
      const str = firstElement(parsePartialJsx("<p>{'こんにちは'}</p>"));
      const num = firstElement(parsePartialJsx('<p>{42}</p>'));

      // Assert
      expect(str.children).toEqual([{ type: 'text', value: 'こんにちは' }]);
      expect(num.children).toEqual([{ type: 'text', value: '42' }]);
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

describe('map 展開とスコープ解決', () => {
  describe('正常系', () => {
    it('配列データから要素を複製し {item.field} を解決する', () => {
      // Arrange
      const scope = { items: [{ label: 'A' }, { label: 'B' }] };

      // Act
      const ul = firstElement(
        parsePartialJsx(
          '<ul>{items.map((it) => <li>{it.label}</li>)}</ul>',
          scope,
        ),
      );

      // Assert
      expect(ul.children).toHaveLength(2);
      expect(ul.children.map(textOf)).toEqual(['A', 'B']);
    });

    it('index 引数を解決する', () => {
      // Arrange
      const scope = { items: ['a', 'b', 'c'] };

      // Act
      const ul = firstElement(
        parsePartialJsx('<ul>{items.map((it, i) => <li>{i}</li>)}</ul>', scope),
      );

      // Assert
      expect(ul.children.map(textOf)).toEqual(['0', '1', '2']);
    });

    it('TSX 全文（const データ + return）を展開する', () => {
      // Arrange
      const tsx = [
        "import { Heading } from '@k8o/arte-odyssey';",
        "const members = [{ name: '田中' }, { name: '佐藤' }];",
        'export default function Preview() {',
        '  return (',
        '    <div>{members.map((m) => <span>{m.name}</span>)}</div>',
        '  );',
        '}',
      ].join('\n');

      // Act
      const div = firstElement(parseStreamingTsx(tsx));

      // Assert
      expect(div.children.map(textOf)).toEqual(['田中', '佐藤']);
    });
  });

  describe('異常系（ストリーミング途中）', () => {
    it('テンプレートが未完なら配列ぶんの部分要素を出す', () => {
      // Arrange
      const scope = { items: [{ x: 1 }, { x: 2 }] };

      // Act
      const div = firstElement(
        parsePartialJsx('<div>{items.map((it) => <Card><Avatar', scope),
      );

      // Assert: 2 枚の Card がそれぞれ pending を抱えて並ぶ
      expect(div.children.map(labelOf)).toEqual(['Card', 'Card']);
      expect(div.children.map(textOf)).toEqual(['', '']);
    });
  });

  describe('エッジケース', () => {
    it('配列を解決できない map は描かない', () => {
      // Arrange & Act
      const ul = firstElement(
        parsePartialJsx('<ul>{items.map((it) => <li>{it}</li>)}</ul>', {}),
      );

      // Assert
      expect(ul.children).toEqual([]);
    });

    it('ネストした map（arr.field.map）を解決する', () => {
      // Arrange
      const scope = {
        groups: [
          { title: 'A', items: ['a1', 'a2'] },
          { title: 'B', items: ['b1'] },
        ],
      };
      const source =
        '<div>{groups.map((g) => (<section><h2>{g.title}</h2><ul>{g.items.map((it) => (<li>{it}</li>))}</ul></section>))}</div>';

      // Act
      const div = firstElement(parsePartialJsx(source, scope));

      // Assert: A(a1,a2) と B(b1) が入れ子で展開される
      expect(textOf(div)).toBe('Aa1a2Bb1');
    });

    it('複製数は上限で打ち切る（巨大配列保護）', () => {
      // Arrange
      const items = Array.from({ length: 600 }, (_, i) => String(i));

      // Act
      const ul = firstElement(
        parsePartialJsx('<ul>{items.map((it) => <i>{it}</i>)}</ul>', { items }),
      );

      // Assert
      expect(ul.children).toHaveLength(500);
    });
  });

  describe('セキュリティ・堅牢性', () => {
    it('存在しないフィールドは prop/子に出さない', () => {
      // Arrange & Act
      const span = firstElement(
        parsePartialJsx('<span>{it.missing}</span>', { it: { name: 'x' } }),
      );

      // Assert
      expect(span.children).toEqual([]);
    });

    it('__proto__ で汚染されたデータ越境値を描かない', () => {
      // Arrange: 1件目は __proto__ 経由で name を偽装、2件目は実データ
      const tsx = [
        'const items = [{ __proto__: { name: "PWNED" } }, { name: "real" }];',
        'export default function Preview() {',
        '  return <div>{items.map((it) => <span>{it.name}</span>)}</div>;',
        '}',
      ].join('\n');

      // Act
      const div = firstElement(parseStreamingTsx(tsx));

      // Assert: PWNED は出ず、実データのみ
      expect(textOf(div)).toBe('real');
    });

    it('テンプレートが要素を形成する前に切れたら pending は 1 つだけ', () => {
      // Arrange
      const scope = { items: [{}, {}, {}] };

      // Act
      const div = firstElement(
        parsePartialJsx('<div>{items.map((it) => <', scope),
      );

      // Assert
      expect(div.children).toEqual([{ type: 'pending' }]);
    });
  });
});
