// 生成コードの `const X = [...]` / `{...}` のインラインリテラルを JS 値へ変換する小さなパーサ。
// `.map()` の展開時に配列データを解決するために使う。式・関数・JSX を含む値は非対応として null を返す。

type Parsed = { value: unknown } | null;
type LiteralResult = { value: unknown; end: number };

const isIdentStart = (c: string): boolean => /[A-Za-z_$]/u.test(c);
const isIdentChar = (c: string): boolean => /[\w$]/u.test(c);

// src[start] からリテラルを 1 つ読む。読めなければ null。end は読み終えた次の位置。
export const parseJsLiteral = (
  src: string,
  start: number,
): LiteralResult | null => {
  const len = src.length;
  let pos = start;
  const at = (i: number): string => src[i] ?? '';
  const ws = (): void => {
    while (pos < len && /\s/u.test(at(pos))) {
      pos += 1;
    }
  };

  const parseString = (quote: string): Parsed => {
    pos += 1;
    let out = '';
    while (pos < len) {
      const c = at(pos);
      if (c === '\\') {
        out += at(pos + 1);
        pos += 2;
        continue;
      }
      // テンプレートリテラルの ${ 補間は静的に解決できないため非対応。
      if (quote === '`' && c === '$' && at(pos + 1) === '{') {
        return null;
      }
      if (c === quote) {
        pos += 1;
        return { value: out };
      }
      out += c;
      pos += 1;
    }
    return null;
  };

  const parseNumber = (): Parsed => {
    const s = pos;
    if (at(pos) === '0' && /[xXoObB]/u.test(at(pos + 1))) {
      // 16/8/2 進。
      pos += 2;
      while (pos < len && /[0-9a-fA-F_]/u.test(at(pos))) {
        pos += 1;
      }
    } else {
      if (at(pos) === '-') {
        pos += 1;
      }
      while (pos < len && /[\d_]/u.test(at(pos))) {
        pos += 1;
      }
      if (at(pos) === '.') {
        pos += 1;
        while (pos < len && /[\d_]/u.test(at(pos))) {
          pos += 1;
        }
      }
      if (at(pos) === 'e' || at(pos) === 'E') {
        pos += 1;
        if (at(pos) === '+' || at(pos) === '-') {
          pos += 1;
        }
        while (pos < len && /\d/u.test(at(pos))) {
          pos += 1;
        }
      }
    }
    if (at(pos) === 'n') {
      // BigInt サフィックス。
      pos += 1;
    }
    const raw = src.slice(s, pos).replaceAll('_', '').replace(/n$/u, '');
    const num = Number(raw);
    return Number.isNaN(num) ? null : { value: num };
  };

  const parseWord = (): Parsed => {
    const s = pos;
    while (pos < len && isIdentChar(at(pos))) {
      pos += 1;
    }
    const word = src.slice(s, pos);
    if (word === 'true') {
      return { value: true };
    }
    if (word === 'false') {
      return { value: false };
    }
    if (word === 'null' || word === 'undefined') {
      return { value: null };
    }
    // 識別子参照は静的に解決できない。
    return null;
  };

  const parseArray = (depth: number): Parsed => {
    pos += 1;
    const arr: unknown[] = [];
    for (;;) {
      ws();
      if (pos >= len) {
        return null;
      }
      if (at(pos) === ']') {
        pos += 1;
        return { value: arr };
      }
      const item = parseValue(depth);
      if (item === null) {
        return null;
      }
      arr.push(item.value);
      ws();
      if (at(pos) === ',') {
        pos += 1;
        continue;
      }
      if (at(pos) === ']') {
        pos += 1;
        return { value: arr };
      }
      return null;
    }
  };

  const parseObject = (depth: number): Parsed => {
    pos += 1;
    const obj: Record<string, unknown> = {};
    for (;;) {
      ws();
      if (pos >= len) {
        return null;
      }
      if (at(pos) === '}') {
        pos += 1;
        return { value: obj };
      }
      const c = at(pos);
      let key: string;
      if (c === '"' || c === "'") {
        const k = parseString(c);
        if (k === null) {
          return null;
        }
        key = String(k.value);
      } else if (isIdentStart(c)) {
        const s = pos;
        while (pos < len && isIdentChar(at(pos))) {
          pos += 1;
        }
        key = src.slice(s, pos);
      } else {
        return null;
      }
      ws();
      if (at(pos) !== ':') {
        return null;
      }
      pos += 1;
      const value = parseValue(depth);
      if (value === null) {
        return null;
      }
      // __proto__ / constructor / prototype は代入しない（プロトタイプ汚染防止）。
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        obj[key] = value.value;
      }
      ws();
      if (at(pos) === ',') {
        pos += 1;
        continue;
      }
      if (at(pos) === '}') {
        pos += 1;
        return { value: obj };
      }
      return null;
    }
  };

  function parseValue(depth: number): Parsed {
    // 深いネストでのスタック超過を避けるためのガード。
    if (depth > 100) {
      return null;
    }
    ws();
    const c = at(pos);
    if (c === '[') {
      return parseArray(depth + 1);
    }
    if (c === '{') {
      return parseObject(depth + 1);
    }
    if (c === '"' || c === "'" || c === '`') {
      return parseString(c);
    }
    if (c === '-' || /\d/u.test(c)) {
      return parseNumber();
    }
    if (isIdentStart(c)) {
      return parseWord();
    }
    return null;
  }

  const result = parseValue(0);
  if (result === null) {
    return null;
  }
  return { value: result.value, end: pos };
};

const CONST_DECL = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*/gu;

// TSX 全文から `const NAME = [..]` / `const NAME = {..}` を拾い、解決できたものだけを
// スコープ（名前→値）にする。`.map()` 展開時の配列解決に使う。
export const buildScope = (tsx: string): Record<string, unknown> => {
  const scope: Record<string, unknown> = {};
  for (const match of tsx.matchAll(CONST_DECL)) {
    const name = match[1];
    if (name === undefined) {
      continue;
    }
    const valueStart = match.index + match[0].length;
    const head = tsx[valueStart] ?? '';
    // 配列/オブジェクトリテラルのみ対象（関数・式・プリミティブは無視）。
    if (head !== '[' && head !== '{') {
      continue;
    }
    // 危険キーは登録しない。同名は最初の宣言を優先（文字列内の偽宣言で上書きさせない）。
    if (
      name === '__proto__' ||
      name === 'constructor' ||
      name === 'prototype' ||
      Object.hasOwn(scope, name)
    ) {
      continue;
    }
    const lit = parseJsLiteral(tsx, valueStart);
    if (lit !== null) {
      scope[name] = lit.value;
    }
  }
  return scope;
};
