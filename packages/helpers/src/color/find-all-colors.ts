/**
 * テキスト文字列内のすべての色の値とその位置を見つけます。
 * HSL、RGB、RGBA、HSLA、HEX、名前付き色をサポートします。
 *
 * @param text - 色の値を検索するテキスト
 * @returns 色の値、開始位置、終了位置を含む色オブジェクトの配列
 */
export function findAllColors(
  text: string,
): { color: string; start: number; end: number }[] {
  const results: { color: string; start: number; end: number }[] = [];

  // 対応する括弧の内容を見つけるヘルパー関数
  function extractFunctionContent(
    text: string,
    funcName: string,
  ): { color: string; start: number; end: number }[] {
    const funcPattern = new RegExp(`${funcName}\\s*\\(`, 'gi');
    const matches: { color: string; start: number; end: number }[] = [];
    let match = funcPattern.exec(text);

    while (match !== null) {
      const startIndex = match.index + match[0].length - 1; // 開き括弧の位置
      let depth = 0;
      let endIndex = -1;

      for (let i = startIndex; i < text.length; i++) {
        if (text[i] === '(') {
          depth++;
        } else if (text[i] === ')') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        const content = text.substring(startIndex + 1, endIndex);
        const fullColor = `${funcName.toLowerCase()}(${content})`;
        matches.push({
          color: fullColor,
          start: match.index,
          end: endIndex + 1,
        });
      }
      match = funcPattern.exec(text);
    }

    return matches;
  }

  // すべての色関数呼び出しを見つける
  const colorFunctions = ['hsl', 'rgb', 'rgba', 'hsla'];
  for (const func of colorFunctions) {
    const matches = extractFunctionContent(text, func);
    results.push(...matches);
  }

  // HEX色を見つける
  const hexPattern = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?=\s|;|,|$|\)|]|})/g;
  let hexMatch = hexPattern.exec(text);
  while (hexMatch !== null) {
    results.push({
      color: hexMatch[0],
      start: hexMatch.index,
      end: hexMatch.index + hexMatch[0].length,
    });

    hexMatch = hexPattern.exec(text);
  }

  // 名前付き色を見つける
  const namedColors = [
    'red',
    'blue',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
    'brown',
    'black',
    'white',
    'gray',
    'grey',
    'cyan',
    'magenta',
    'lime',
    'navy',
    'maroon',
    'olive',
    'teal',
    'silver',
    'gold',
    'indigo',
    'violet',
  ];

  const lowerText = text.toLowerCase();
  for (const color of namedColors) {
    let startIndex = 0;
    let index = lowerText.indexOf(color, startIndex);
    while (index !== -1) {
      // 完全な単語かどうかをチェック
      const beforeChar = index > 0 ? (lowerText[index - 1] ?? ' ') : ' ';
      const afterChar =
        index + color.length < lowerText.length
          ? (lowerText[index + color.length] ?? ' ')
          : ' ';

      if (/\s|;|,|:/.test(beforeChar) && /\s|;|,|$|\)|]|}/.test(afterChar)) {
        results.push({
          color,
          start: index,
          end: index + color.length,
        });
      }

      startIndex = index + 1;
      index = lowerText.indexOf(color, startIndex);
    }
  }

  // 位置でソートし、重複を除去
  results.sort((a, b) => a.start - b.start);
  const filteredResults: {
    color: string;
    start: number;
    end: number;
  }[] = [];

  for (const result of results) {
    const hasOverlap = filteredResults.some(
      (existing) =>
        (result.start >= existing.start && result.start < existing.end) ||
        (result.end > existing.start && result.end <= existing.end) ||
        (result.start <= existing.start && result.end >= existing.end),
    );

    if (!hasOverlap) {
      filteredResults.push(result);
    }
  }

  return filteredResults;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('findAllColors', () => {
    describe('単一の色の場合', () => {
      it('HSL色を見つける', () => {
        const result = findAllColors('hsl(280, 70%, 50%)');
        expect(result).toEqual([
          { color: 'hsl(280, 70%, 50%)', start: 0, end: 18 },
        ]);
      });

      it('HEX色を見つける', () => {
        const result = findAllColors('#ff0080');
        expect(result).toEqual([{ color: '#ff0080', start: 0, end: 7 }]);
      });

      it('名前付き色を見つける', () => {
        const result = findAllColors('background-color: red;');
        expect(result).toEqual([{ color: 'red', start: 18, end: 21 }]);
      });
    });

    describe('複数の色の場合', () => {
      it('異なる形式の複数の色を見つける', () => {
        const result = findAllColors(
          'border: 1px solid #ff0080; background: hsl(280, 70%, 50%); color: white;',
        );
        expect(result).toEqual([
          { color: '#ff0080', start: 18, end: 25 },
          { color: 'hsl(280, 70%, 50%)', start: 39, end: 57 },
          { color: 'white', start: 66, end: 71 },
        ]);
      });

      it('gradient内の複数の色を見つける', () => {
        const result = findAllColors(
          'linear-gradient(45deg, #ff0080, hsl(280, 70%, 50%), rgba(255, 0, 128, 0.5))',
        );
        expect(result).toEqual([
          { color: '#ff0080', start: 23, end: 30 },
          { color: 'hsl(280, 70%, 50%)', start: 32, end: 50 },
          { color: 'rgba(255, 0, 128, 0.5)', start: 52, end: 74 },
        ]);
      });
    });

    describe('重複する色パターンの場合', () => {
      it('関数型色を名前付き色より優先する', () => {
        const result = findAllColors('rgb(255, 0, 0) red');
        expect(result).toEqual([
          { color: 'rgb(255, 0, 0)', start: 0, end: 14 },
          { color: 'red', start: 15, end: 18 },
        ]);
      });

      it('重複する領域では最初の色のみを保持する', () => {
        const result = findAllColors('background-color: red');
        expect(result).toEqual([{ color: 'red', start: 18, end: 21 }]);
      });
    });

    describe('複雑なCSS関数の場合', () => {
      it('calc式を含むHSL色を見つける', () => {
        const result = findAllColors('hsl(calc(var(--hue) + 50), 70%, 50%)');
        expect(result).toEqual([
          {
            color: 'hsl(calc(var(--hue) + 50), 70%, 50%)',
            start: 0,
            end: 36,
          },
        ]);
      });

      it('ネストした括弧を含む色を見つける', () => {
        const result = findAllColors(
          'hsl(calc(sign(var(--x)) * 80 + 200), 70%, 50%)',
        );
        expect(result).toEqual([
          {
            color: 'hsl(calc(sign(var(--x)) * 80 + 200), 70%, 50%)',
            start: 0,
            end: 46,
          },
        ]);
      });
    });

    describe('色が見つからない場合', () => {
      it('空の配列を返す', () => {
        const result = findAllColors('transform: translateX(100px);');
        expect(result).toEqual([]);
      });

      it('色でないテキストでは空の配列を返す', () => {
        const result = findAllColors('font-size: 16px; margin: 10px;');
        expect(result).toEqual([]);
      });
    });

    describe('エッジケース', () => {
      it('同じ色が複数回出現する場合', () => {
        const result = findAllColors('color: red; border-color: red;');
        expect(result).toEqual([
          { color: 'red', start: 7, end: 10 },
          { color: 'red', start: 26, end: 29 },
        ]);
      });

      it('文字列の境界での色検出', () => {
        const result = findAllColors('red');
        expect(result).toEqual([{ color: 'red', start: 0, end: 3 }]);
      });
    });
  });
}
