import { buildScope } from './js-literal';
import type { JsxAttr, JsxNode, JsxProp } from './types';

// ストリーミング途中の TSX 文字列を寛容にパースし、受信済みの部分だけを軽量 AST にする。
// Vite/esbuild に途中コードを食わせる方式と違い、コンパイルを介さないので未完入力でも壊れない。
// 未受信の先端（開いたままの最深要素）には 1 つだけ pending ノードを差す（single frontier）。
//
// scope は `const X = [...]` 由来のデータと、`.map()` 展開時のループ変数を保持する。
// これにより `{item.name}` の解決と、配列データからのカード複製（逐次表示）ができる。

const isNameStart = (c: string): boolean => /[A-Za-z]/u.test(c);
const isNameChar = (c: string): boolean => /[A-Za-z0-9]/u.test(c);
const isIdentStart = (c: string): boolean => /[A-Za-z_$]/u.test(c);
const isIdentChar = (c: string): boolean => /[\w$]/u.test(c);

// `item` / `item.field.sub` のような純粋なドット参照のみ受け付ける。
const IDENT_PATH = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/u;

// 1 回の map 展開で生成する要素数の上限（巨大配列でのクラッシュ/フリーズ防止）。
const MAX_MAP_ITEMS = 500;

// スコープから式パスを解決する。各段で hasOwn を確認し、継承プロパティ（toString 等）や
// 存在しないフィールドは found:false にして「データに無い値」を描かない。
const resolvePath = (
  expr: string,
  scope: Record<string, unknown>,
): { found: boolean; value: unknown } => {
  const parts = expr.split('.');
  const head = parts[0];
  if (head === undefined || !Object.hasOwn(scope, head)) {
    return { found: false, value: undefined };
  }
  let current: unknown = scope[head];
  for (const key of parts.slice(1)) {
    if (
      current === null ||
      typeof current !== 'object' ||
      !Object.hasOwn(current, key)
    ) {
      return { found: false, value: undefined };
    }
    current = (current as Record<string, unknown>)[key];
  }
  return { found: true, value: current };
};

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

export const parsePartialJsx = (
  source: string,
  scope: Record<string, unknown> = {},
): readonly JsxNode[] => {
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

  const readIdent = (): string => {
    if (pos >= len || !isIdentStart(at(pos))) {
      return '';
    }
    const start = pos;
    while (pos < len && isIdentChar(at(pos))) {
      pos += 1;
    }
    return source.slice(start, pos);
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

  // `{...}` の内側を分類する。リテラル・スコープ解決・ネスト JSX 以外は unsupported。
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
    // スコープ解決（`{item.name}` 等）。map 展開時にループ変数が入っている。
    if (IDENT_PATH.test(inner)) {
      const resolved = resolvePath(inner, scope);
      if (resolved.found) {
        const { value } = resolved;
        if (typeof value === 'string') {
          return { kind: 'string', value };
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
          return { kind: 'literal', value };
        }
        if (value === null || value === undefined) {
          return { kind: 'literal', value: null };
        }
        return { kind: 'unsupported', raw: innerRaw };
      }
    }
    if (head === '<') {
      // ネスト JSX（startIcon={<SparklesIcon />} 等）。スコープを引き継ぐ。
      const nested = parsePartialJsx(inner, scope);
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

  // map 式の `{` に対応する `}` まで（テンプレ後の `))` も含めて）寛容に消費する。
  const consumeMapTail = (): void => {
    let depth = 1;
    while (pos < len) {
      const c = at(pos);
      if (c === '"' || c === "'" || c === '`') {
        skipString(c);
        continue;
      }
      if (c === '{') {
        depth += 1;
      } else if (c === '}') {
        depth -= 1;
        pos += 1;
        if (depth === 0) {
          return;
        }
        continue;
      }
      pos += 1;
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

  // `{配列.map((item, i) => ( <JSX> ))}` を検出して配列要素ぶん複製する。
  // map でなければ pos を戻して null（呼び出し側が通常の式として処理する）。
  const parseMap = (): JsxNode[] | null => {
    const save = pos;
    // 先頭の `{` を消費する。
    pos += 1;
    skipWs();
    // 配列パス（`items` / `g.items` 等）と末尾の `.map` を読む。
    let path = readIdent();
    while (path !== '' && at(pos) === '.' && isIdentStart(at(pos + 1))) {
      pos += 1;
      path += `.${readIdent()}`;
    }
    const segments = path.split('.');
    if (segments.length < 2 || segments.at(-1) !== 'map') {
      pos = save;
      return null;
    }
    const arrPath = segments.slice(0, -1).join('.');
    skipWs();
    if (at(pos) !== '(') {
      pos = save;
      return null;
    }
    pos += 1;
    skipWs();
    // コールバックの引数（(item) / (item, i) / item）。
    const params: string[] = [];
    if (at(pos) === '(') {
      pos += 1;
      for (;;) {
        skipWs();
        const param = readIdent();
        if (param !== '') {
          params.push(param);
        }
        skipWs();
        if (at(pos) === ',') {
          pos += 1;
          continue;
        }
        if (at(pos) === ')') {
          pos += 1;
          break;
        }
        // 分割代入など想定外 → 通常式に委ねる。
        pos = save;
        return null;
      }
    } else {
      const param = readIdent();
      if (param === '') {
        pos = save;
        return null;
      }
      params.push(param);
    }
    skipWs();
    if (at(pos) !== '=' || at(pos + 1) !== '>') {
      pos = save;
      return null;
    }
    pos += 2;
    skipWs();
    if (at(pos) === '(') {
      pos += 1;
      skipWs();
    }
    if (at(pos) !== '<') {
      // テンプレートが要素で始まらない（ブロック本体・三項等）→ 通常式に委ねる。
      pos = save;
      return null;
    }
    // テンプレート（単一の根要素）の文字列を切り出す。未完なら truncated が立つ。
    const tplStart = pos;
    const tplEl = parseElement();
    const templateStr = source.slice(tplStart, pos);
    consumeMapTail();

    const resolved = resolvePath(arrPath, scope);
    if (!resolved.found || !Array.isArray(resolved.value)) {
      // 配列を解決できない（外部データ・props 等）→ 描かない。消費だけ済ませる。
      return [];
    }
    if (tplEl === null) {
      // テンプレートが根要素を形成する前に切れた → 複製せず単一 pending（先端）。
      truncated = true;
      return [{ type: 'pending' }];
    }
    const items = resolved.value.slice(0, MAX_MAP_ITEMS);
    const nodes: JsxNode[] = [];
    for (const [index, item] of items.entries()) {
      const itemScope: Record<string, unknown> = { ...scope };
      if (params[0] !== undefined) {
        itemScope[params[0]] = item;
      }
      if (params[1] !== undefined) {
        itemScope[params[1]] = index;
      }
      // spread を避けて逐次 push（巨大配列でのスタック超過防止）。
      for (const node of parsePartialJsx(templateStr, itemScope)) {
        nodes.push(node);
      }
    }
    return nodes;
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
        // まず map 展開を試し、map でなければ通常の式として処理する。
        const mapNodes = parseMap();
        if (mapNodes !== null) {
          // spread を避けて逐次 push（巨大配列でのスタック超過防止）。
          for (const node of mapNodes) {
            children.push(node);
          }
          if (truncated) {
            return children;
          }
          continue;
        }
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

// TSX 全文を受け取り、データスコープを作って JSX 本体をパースする薄いラッパ。
export const parseStreamingTsx = (tsx: string): readonly JsxNode[] =>
  parsePartialJsx(extractJsxBody(tsx), buildScope(tsx));
