import type { JsxAttr, JsxNode, JsxProp } from './types';

// ストリーミング途中の TSX 文字列を寛容にパースし、受信済みの部分だけを軽量 AST にする。
// Vite/esbuild に途中コードを食わせる方式と違い、コンパイルを介さないので未完入力でも壊れない。
// 未受信の先端（開いたままの最深要素）には 1 つだけ pending ノードを差す（single frontier）。

const isNameStart = (c: string): boolean => /[A-Za-z]/u.test(c);
const isNameChar = (c: string): boolean => /[A-Za-z0-9]/u.test(c);

// TSX 全文から `return` 直後の JSX 本体を切り出す。まだ JSX に到達していなければ空文字。
export const extractJsxBody = (tsx: string): string => {
  const returnIdx = tsx.search(/\breturn\b/u);
  if (returnIdx === -1) {
    return '';
  }
  const lt = tsx.indexOf('<', returnIdx);
  if (lt === -1) {
    return '';
  }
  return tsx.slice(lt);
};

export const parsePartialJsx = (source: string): readonly JsxNode[] => {
  const len = source.length;
  let pos = 0;
  // 最深の未完点に pending を 1 つだけ置くためのフラグ。立ったら以降の兄弟・末尾は読まない。
  let truncated = false;

  const at = (i: number): string => source[i] ?? '';

  const skipWs = (): void => {
    while (pos < len && /\s/u.test(at(pos))) {
      pos += 1;
    }
  };

  // 文字列リテラルを末尾の同種クォートまで読み飛ばす。EOF なら false。
  const skipString = (quote: string): boolean => {
    pos += 1;
    while (pos < len) {
      const c = at(pos);
      if (c === '\\') {
        pos += 2;
        continue;
      }
      if (c === quote) {
        pos += 1;
        return true;
      }
      pos += 1;
    }
    return false;
  };

  // `{` から対応する `}` までの内側文字列を返す（クォート内のブレースは無視）。EOF なら null。
  const readBracedInner = (): string | null => {
    const start = pos;
    let depth = 0;
    while (pos < len) {
      const c = at(pos);
      if (c === '"' || c === "'" || c === '`') {
        if (!skipString(c)) {
          return null;
        }
        continue;
      }
      if (c === '{') {
        depth += 1;
      } else if (c === '}') {
        depth -= 1;
        if (depth === 0) {
          const inner = source.slice(start + 1, pos);
          pos += 1;
          return inner;
        }
      }
      pos += 1;
    }
    return null;
  };

  // `{...}` の内側を分類する。リテラル・ネスト JSX 以外は unsupported。
  const classifyExpression = (innerRaw: string): JsxAttr => {
    const inner = innerRaw.trim();
    if (inner === '') {
      return { kind: 'unsupported', raw: innerRaw };
    }
    const head = inner[0] ?? '';
    const tail = inner.at(-1) ?? '';
    if ((head === '"' || head === "'") && tail === head && inner.length >= 2) {
      return { kind: 'string', value: inner.slice(1, -1) };
    }
    if (head === '`' && tail === '`' && !inner.includes('${')) {
      return { kind: 'string', value: inner.slice(1, -1) };
    }
    if (/^-?\d+(?:\.\d+)?$/u.test(inner)) {
      return { kind: 'literal', value: Number(inner) };
    }
    if (inner === 'true' || inner === 'false') {
      return { kind: 'literal', value: inner === 'true' };
    }
    if (inner === 'null' || inner === 'undefined') {
      return { kind: 'literal', value: null };
    }
    if (head === '<') {
      // ネスト JSX（startIcon={<SparklesIcon />} 等）。
      const nested = parsePartialJsx(inner);
      for (const node of nested) {
        if (node.type === 'element') {
          return { kind: 'element', value: node };
        }
      }
    }
    return { kind: 'unsupported', raw: innerRaw };
  };

  // 属性を 1 つ読む。タグ途中で EOF なら null。
  const parseAttribute = (): JsxProp | null => {
    if (at(pos) === '{') {
      // {...props} など。対応外だが消費はする。
      const inner = readBracedInner();
      if (inner === null) {
        return null;
      }
      return { name: '...spread', value: { kind: 'unsupported', raw: inner } };
    }
    let name = '';
    while (pos < len && (isNameChar(at(pos)) || at(pos) === '-')) {
      name += at(pos);
      pos += 1;
    }
    if (name === '') {
      // 想定外文字。1 文字進めて無害なダミー（描画側で空名はスキップ）。
      pos += 1;
      return { name: '', value: { kind: 'boolean' } };
    }
    skipWs();
    if (at(pos) !== '=') {
      // 真偽値短縮（<input disabled> 等）。
      return { name, value: { kind: 'boolean' } };
    }
    pos += 1;
    if (pos >= len) {
      return null;
    }
    const v = at(pos);
    if (v === '"' || v === "'") {
      const start = pos;
      if (!skipString(v)) {
        return null;
      }
      return {
        name,
        value: { kind: 'string', value: source.slice(start + 1, pos - 1) },
      };
    }
    if (v === '{') {
      const inner = readBracedInner();
      if (inner === null) {
        return null;
      }
      return { name, value: classifyExpression(inner) };
    }
    // 裸の値（想定外）。空白までを raw として保持。
    const start = pos;
    while (pos < len && !/[\s/>]/u.test(at(pos))) {
      pos += 1;
    }
    return {
      name,
      value: { kind: 'unsupported', raw: source.slice(start, pos) },
    };
  };

  // 親の閉じタグ `</...>`（または `</>`）を寛容に消費する。名前は照合しない。
  const consumeCloseTag = (): void => {
    if (at(pos) === '<' && at(pos + 1) === '/') {
      while (pos < len && at(pos) !== '>') {
        pos += 1;
      }
      if (pos < len) {
        pos += 1;
      }
    }
  };

  // `<` 始まりの要素を読む。開始タグが途中で切れたら null（= 先端）。
  const parseElement = (): JsxNode | null => {
    // 先頭の `<` を消費する。
    pos += 1;
    if (at(pos) === '>') {
      // フラグメント <>...</>
      pos += 1;
      const children = parseChildren();
      if (pos >= len && !truncated) {
        children.push({ type: 'pending' });
        truncated = true;
      }
      consumeCloseTag();
      return { type: 'element', name: '', props: [], children };
    }
    if (pos >= len || !isNameStart(at(pos))) {
      return null;
    }
    let name = '';
    while (pos < len && isNameChar(at(pos))) {
      name += at(pos);
      pos += 1;
    }
    const props: JsxProp[] = [];
    for (;;) {
      skipWs();
      if (pos >= len) {
        return null;
      }
      const c = at(pos);
      if (c === '/') {
        if (at(pos + 1) === '>') {
          pos += 2;
          return { type: 'element', name, props, children: [] };
        }
        if (pos + 1 >= len) {
          return null;
        }
        // 不正な `/` はスキップする。
        pos += 1;
        continue;
      }
      if (c === '>') {
        pos += 1;
        const children = parseChildren();
        if (pos >= len && !truncated) {
          // 子は読めたが閉じタグ未到達 → ここが先端。
          children.push({ type: 'pending' });
          truncated = true;
        }
        consumeCloseTag();
        return { type: 'element', name, props, children };
      }
      const attr = parseAttribute();
      if (attr === null) {
        return null;
      }
      props.push(attr);
    }
  };

  // 子要素の式 `{...}`。truncated を表す 'pending'、描かない場合は null。
  const parseExpressionChild = (): JsxNode | 'pending' | null => {
    const inner = readBracedInner();
    if (inner === null) {
      return 'pending';
    }
    const attr = classifyExpression(inner);
    if (attr.kind === 'string') {
      return { type: 'text', value: attr.value };
    }
    if (attr.kind === 'literal') {
      return attr.value === null
        ? null
        : { type: 'text', value: String(attr.value) };
    }
    if (attr.kind === 'element') {
      return attr.value;
    }
    // unsupported は子として描かない。
    return null;
  };

  const parseText = (): string => {
    const start = pos;
    while (pos < len && at(pos) !== '<' && at(pos) !== '{') {
      pos += 1;
    }
    return source.slice(start, pos);
  };

  function parseChildren(): JsxNode[] {
    const children: JsxNode[] = [];
    // pos は parseElement / parseText 等の内部で前進するため直接の変更が見えない。
    // eslint-disable-next-line no-unmodified-loop-condition
    while (pos < len) {
      const c = at(pos);
      if (c === '<') {
        if (at(pos + 1) === '/') {
          // 親の閉じタグ。呼び出し側が消費する。
          return children;
        }
        const el = parseElement();
        if (el === null) {
          children.push({ type: 'pending' });
          truncated = true;
          return children;
        }
        children.push(el);
        if (truncated) {
          return children;
        }
        continue;
      }
      if (c === '{') {
        const node = parseExpressionChild();
        if (node === 'pending') {
          children.push({ type: 'pending' });
          truncated = true;
          return children;
        }
        if (node !== null) {
          children.push(node);
        }
        continue;
      }
      const text = parseText();
      if (text !== '') {
        children.push({ type: 'text', value: text });
      }
    }
    return children;
  }

  return parseChildren();
};

// TSX 全文を受け取り、JSX 本体を抽出してパースする薄いラッパ。
export const parseStreamingTsx = (tsx: string): readonly JsxNode[] =>
  parsePartialJsx(extractJsxBody(tsx));
