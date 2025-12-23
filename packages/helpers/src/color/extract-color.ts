/**
 * テキスト文字列から最初に見つかった色の値を抽出します。
 * HSL、RGB、RGBA、HSLA、HEX、名前付き色をサポートします。
 *
 * @param text - 色の値を検索するテキスト
 * @returns 最初に見つかった色の値、または色が検出されなかった場合はnull
 */
export function extractColor(text: string): string | null {
  // 対応する括弧の内容を見つけるヘルパー関数
  function extractFunctionContent(
    text: string,
    funcName: string,
  ): string | null {
    const funcPattern = new RegExp(`${funcName}\\s*\\(`, 'i');
    const match = text.match(funcPattern);
    if (!match) return null;

    const startIndex = (match.index ?? 0) + match[0].length - 1; // 開き括弧の位置
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

    if (endIndex === -1) return null;

    const content = text.substring(startIndex + 1, endIndex);
    return `${funcName.toLowerCase()}(${content})`;
  }

  // HSLパターン: hsl(h, s%, l%) ネストした括弧をサポート
  const hslMatch = extractFunctionContent(text, 'hsl');
  if (hslMatch) {
    return hslMatch;
  }

  // RGBパターン: rgb(r, g, b) ネストした括弧をサポート
  const rgbMatch = extractFunctionContent(text, 'rgb');
  if (rgbMatch) {
    return rgbMatch;
  }

  // RGBAパターン: rgba(r, g, b, a) ネストした括弧をサポート
  const rgbaMatch = extractFunctionContent(text, 'rgba');
  if (rgbaMatch) {
    return rgbaMatch;
  }

  // HSLAパターン: hsla(h, s%, l%, a) ネストした括弧をサポート
  const hslaMatch = extractFunctionContent(text, 'hsla');
  if (hslaMatch) {
    return hslaMatch;
  }

  // HEXパターン: #rgb または #rrggbb（単語境界または文字列の終端が必要）
  const hexPattern = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?=\s|;|,|$|\)|]|})/;
  const hexMatch = hexPattern.exec(text);
  if (hexMatch) {
    return hexMatch[0];
  }

  // 名前付き色（基本的なもの）
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
    if (lowerText.includes(color)) {
      return color;
    }
  }

  return null;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('extractColor', () => {
    describe('HSL色の値を含むテキストの場合', () => {
      it('スペースありのHSL色を抽出する', () => {
        const result = extractColor('hsl(280, 70%, 50%)');
        expect(result).toBe('hsl(280, 70%, 50%)');
      });

      it('スペースなしのHSL色を抽出する', () => {
        const result = extractColor('hsl(280,70%,50%)');
        expect(result).toBe('hsl(280,70%,50%)');
      });

      it('余分な空白があるHSL色を抽出する', () => {
        const result = extractColor('hsl( 280 , 70% , 50% )');
        expect(result).toBe('hsl( 280 , 70% , 50% )');
      });

      it('大文字小文字を区別せずHSL色を抽出する', () => {
        const result = extractColor('HSL(280, 70%, 50%)');
        expect(result).toBe('hsl(280, 70%, 50%)');
      });

      it('CSSプロパティからHSL色を抽出する', () => {
        const result = extractColor('background-color: hsl(280, 70%, 50%);');
        expect(result).toBe('hsl(280, 70%, 50%)');
      });

      it('複数ある場合は最初のHSL色を抽出する', () => {
        const result = extractColor(
          'hsl(280, 70%, 50%) and hsl(120, 60%, 40%)',
        );
        expect(result).toBe('hsl(280, 70%, 50%)');
      });
    });

    describe('RGB色の値を含むテキストの場合', () => {
      it('スペースありのRGB色を抽出する', () => {
        const result = extractColor('rgb(255, 0, 128)');
        expect(result).toBe('rgb(255, 0, 128)');
      });

      it('スペースなしのRGB色を抽出する', () => {
        const result = extractColor('rgb(255,0,128)');
        expect(result).toBe('rgb(255,0,128)');
      });

      it('大文字小文字を区別せずRGB色を抽出する', () => {
        const result = extractColor('RGB(255, 0, 128)');
        expect(result).toBe('rgb(255, 0, 128)');
      });

      it('CSSプロパティからRGB色を抽出する', () => {
        const result = extractColor('color: rgb(255, 0, 128);');
        expect(result).toBe('rgb(255, 0, 128)');
      });
    });

    describe('RGBA色の値を含むテキストの場合', () => {
      it('RGBA色を抽出する', () => {
        const result = extractColor('rgba(255, 0, 128, 0.5)');
        expect(result).toBe('rgba(255, 0, 128, 0.5)');
      });

      it('小数点のアルファ値のRGBA色を抽出する', () => {
        const result = extractColor('rgba(255, 0, 128, 0.75)');
        expect(result).toBe('rgba(255, 0, 128, 0.75)');
      });

      it('大文字小文字を区別せずRGBA色を抽出する', () => {
        const result = extractColor('RGBA(255, 0, 128, 1)');
        expect(result).toBe('rgba(255, 0, 128, 1)');
      });
    });

    describe('HSLA色の値を含むテキストの場合', () => {
      it('HSLA色を抽出する', () => {
        const result = extractColor('hsla(280, 70%, 50%, 0.8)');
        expect(result).toBe('hsla(280, 70%, 50%, 0.8)');
      });

      it('大文字小文字を区別せずHSLA色を抽出する', () => {
        const result = extractColor('HSLA(280, 70%, 50%, 0.5)');
        expect(result).toBe('hsla(280, 70%, 50%, 0.5)');
      });
    });

    describe('HEX色の値を含むテキストの場合', () => {
      it('6桁のHEX色を抽出する', () => {
        const result = extractColor('#ff0080');
        expect(result).toBe('#ff0080');
      });

      it('3桁のHEX色を抽出する', () => {
        const result = extractColor('#f08');
        expect(result).toBe('#f08');
      });

      it('大文字のHEX色を抽出する', () => {
        const result = extractColor('#FF0080');
        expect(result).toBe('#FF0080');
      });

      it('大文字小文字混在のHEX色を抽出する', () => {
        const result = extractColor('#Ff0080');
        expect(result).toBe('#Ff0080');
      });

      it('CSSプロパティからHEX色を抽出する', () => {
        const result = extractColor('border-color: #ff0080;');
        expect(result).toBe('#ff0080');
      });

      it('無効なHEXパターンは抽出しない', () => {
        const result = extractColor('#ff008');
        expect(result).toBeNull();
      });

      it('単語境界のないHEXは抽出しない', () => {
        const result = extractColor('text-#ff0080-more');
        expect(result).toBeNull();
      });
    });

    describe('名前付き色の値を含むテキストの場合', () => {
      it('基本的な名前付き色を抽出する', () => {
        const result = extractColor('red');
        expect(result).toBe('red');
      });

      it('大文字小文字を区別せず名前付き色を抽出する', () => {
        const result = extractColor('RED');
        expect(result).toBe('red');
      });

      it('CSSプロパティから名前付き色を抽出する', () => {
        const result = extractColor('background-color: blue;');
        expect(result).toBe('blue');
      });

      it('複数ある場合は最初の名前付き色を抽出する', () => {
        const result = extractColor('red and blue');
        expect(result).toBe('red');
      });

      it('様々な名前付き色をサポートする', () => {
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

        for (const color of namedColors) {
          const result = extractColor(color);
          expect(result).toBe(color);
        }
      });
    });

    describe('混在する色フォーマットを含むテキストの場合', () => {
      it('HSLを他のフォーマットより優先する', () => {
        const result = extractColor(
          'hsl(280, 70%, 50%) rgb(255, 0, 128) #ff0080',
        );
        expect(result).toBe('hsl(280, 70%, 50%)');
      });

      it('RGBをHEXと名前付き色より優先する', () => {
        const result = extractColor('rgb(255, 0, 128) #ff0080 red');
        expect(result).toBe('rgb(255, 0, 128)');
      });

      it('RGBAをHSLAより優先する', () => {
        const result = extractColor(
          'rgba(255, 0, 128, 0.5) hsla(280, 70%, 50%, 0.8)',
        );
        expect(result).toBe('rgba(255, 0, 128, 0.5)');
      });

      it('HEXを名前付き色より優先する', () => {
        const result = extractColor('#ff0080 red');
        expect(result).toBe('#ff0080');
      });
    });

    describe('色の値を含む複雑なCSSの場合', () => {
      it('calc式から色を抽出する', () => {
        const result = extractColor(
          'hsl(calc(sign(var(--x)) * 80 + 200), 70%, 50%)',
        );
        expect(result).toBe('hsl(calc(sign(var(--x)) * 80 + 200), 70%, 50%)');
      });

      it('複数行CSSから色を抽出する', () => {
        const cssText = `
          .element {
            background-color: hsl(280, 70%, 50%);
            border: 1px solid #ccc;
          }
        `;
        const result = extractColor(cssText);
        expect(result).toBe('hsl(280, 70%, 50%)');
      });

      it('CSS変数の使用から色を抽出する', () => {
        const result = extractColor(
          'background-color: hsl(var(--hue), 70%, 50%);',
        );
        expect(result).toBe('hsl(var(--hue), 70%, 50%)');
      });
    });

    describe('色の値を含まないテキストの場合', () => {
      it('空文字列の場合はnullを返す', () => {
        const result = extractColor('');
        expect(result).toBeNull();
      });

      it('色のないテキストの場合はnullを返す', () => {
        const result = extractColor('transform: translateX(100px);');
        expect(result).toBeNull();
      });

      it('部分的な色パターンの場合はnullを返す', () => {
        const result = extractColor('hsl( rgb( #ff');
        expect(result).toBeNull();
      });
    });

    describe('エッジケース', () => {
      it('特殊文字を含むテキストを処理する', () => {
        const result = extractColor(
          'background: url("data:image/svg+xml,<svg>...hsl(280, 70%, 50%)...</svg>");',
        );
        expect(result).toBe('hsl(280, 70%, 50%)');
      });

      it('ネストした括弧を処理する', () => {
        const result = extractColor('hsl(calc(var(--base) + 50), 70%, 50%)');
        expect(result).toBe('hsl(calc(var(--base) + 50), 70%, 50%)');
      });

      it('複数のスペースとタブを処理する', () => {
        const result = extractColor('hsl(\t280\t,\t70%\t,\t50%\t)');
        expect(result).toBe('hsl(\t280\t,\t70%\t,\t50%\t)');
      });
    });
  });
}
