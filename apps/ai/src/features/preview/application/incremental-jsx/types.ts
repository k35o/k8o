// 自前のインクリメンタル JSX パーサが生成する軽量 AST。
// ストリーミング途中の未完入力を寛容に扱い、未受信の先端は pending ノードで表す。
// 対応するのは「宣言的サブセット」のみ: ホスト要素 / コンポーネント / フラグメント、
// 文字列・リテラル・真偽値短縮・ネスト JSX の属性、テキストとネスト。
// 関数・三項・.map・スプレッドなどは unsupported として保持し、描画側でスキップする。

// 属性値の種類。描画側でこのタグに応じて実際の prop 値へ解決する。
export type JsxAttr =
  | { readonly kind: 'string'; readonly value: string }
  | {
      readonly kind: 'literal';
      readonly value: string | number | boolean | null;
    }
  | { readonly kind: 'element'; readonly value: JsxElement }
  | { readonly kind: 'boolean' }
  | { readonly kind: 'unsupported'; readonly raw: string };

export type JsxProp = { readonly name: string; readonly value: JsxAttr };

// name === '' はフラグメント（<>...</>）。
export type JsxElement = {
  readonly type: 'element';
  readonly name: string;
  readonly props: readonly JsxProp[];
  readonly children: readonly JsxNode[];
};

type JsxText = { readonly type: 'text'; readonly value: string };

// 未受信の先端。描画側でスケルトンに置き換える。
type JsxPending = { readonly type: 'pending' };

export type JsxNode = JsxElement | JsxText | JsxPending;
