import { buildScope, parseJsLiteral } from './js-literal';

describe('parseJsLiteral', () => {
  describe('正常系', () => {
    it('オブジェクト配列を JS 値へ変換する', () => {
      // Arrange
      const src = "[{ name: '田中', age: 20, admin: true }]";

      // Act
      const result = parseJsLiteral(src, 0);

      // Assert
      expect(result?.value).toEqual([{ name: '田中', age: 20, admin: true }]);
    });

    it('末尾カンマとネストを許容する', () => {
      // Arrange
      const src = "{ tags: ['a', 'b',], meta: { n: 1 } }";

      // Act
      const result = parseJsLiteral(src, 0);

      // Assert
      expect(result?.value).toEqual({ tags: ['a', 'b'], meta: { n: 1 } });
    });

    it('null / false を解決する', () => {
      // Arrange & Act
      const result = parseJsLiteral('[null, false]', 0);

      // Assert
      expect(result?.value).toEqual([null, false]);
    });

    it('指数・16進・桁区切りの数値を解決する', () => {
      // Arrange & Act
      const result = parseJsLiteral('[1e3, 0x10, 1_000, -2.5]', 0);

      // Assert
      expect(result?.value).toEqual([1000, 16, 1000, -2.5]);
    });
  });

  describe('セキュリティ', () => {
    it('__proto__ キーはプロトタイプを汚染せず無視される', () => {
      // Arrange
      const src = '[{ __proto__: { name: "PWNED" }, name: "real" }]';

      // Act
      const result = parseJsLiteral(src, 0);

      // Assert
      expect(result?.value).toEqual([{ name: 'real' }]);
    });

    it('深すぎるネストは throw せず null を返す', () => {
      // Arrange
      const deep = `${'['.repeat(300)}1${']'.repeat(300)}`;

      // Act & Assert
      expect(parseJsLiteral(deep, 0)).toBeNull();
    });
  });

  describe('異常系', () => {
    it('識別子参照を含む値は null', () => {
      // Arrange & Act & Assert
      expect(parseJsLiteral('[foo]', 0)).toBeNull();
    });

    it('テンプレートリテラルの補間は null', () => {
      // Arrange & Act & Assert
      // oxlint-disable-next-line eslint/no-template-curly-in-string -- テンプレートリテラルを含む入力のパースを検証するテストデータ
      expect(parseJsLiteral('[`${x}`]', 0)).toBeNull();
    });

    it('閉じていない配列は null', () => {
      // Arrange & Act & Assert
      expect(parseJsLiteral('[1, 2', 0)).toBeNull();
    });
  });
});

describe('buildScope', () => {
  describe('正常系', () => {
    it('const のインライン配列/オブジェクトを拾う', () => {
      // Arrange
      const tsx = "const members = [{ name: 'A' }];\nreturn (<div/>);";

      // Act
      const scope = buildScope(tsx);

      // Assert
      expect(scope['members']).toEqual([{ name: 'A' }]);
    });
  });

  describe('エッジケース', () => {
    it('プリミティブや解決不能な const は無視する', () => {
      // Arrange
      const tsx = 'const n = 3;\nconst data = fetchData();\nconst items = [1];';

      // Act
      const scope = buildScope(tsx);

      // Assert
      expect('n' in scope).toBe(false);
      expect('data' in scope).toBe(false);
      expect(scope['items']).toEqual([1]);
    });

    it('同名 const は最初の宣言を優先する', () => {
      // Arrange
      const tsx = 'const x = [1];\nconst x = [2];';

      // Act
      const scope = buildScope(tsx);

      // Assert
      expect(scope['x']).toEqual([1]);
    });

    it('const __proto__ はスコープを汚染しない', () => {
      // Arrange
      const tsx = 'const __proto__ = [9];\nconst items = [1];';

      // Act
      const scope = buildScope(tsx);

      // Assert
      expect(Object.hasOwn(scope, '__proto__')).toBe(false);
      expect(scope['items']).toEqual([1]);
    });
  });
});
