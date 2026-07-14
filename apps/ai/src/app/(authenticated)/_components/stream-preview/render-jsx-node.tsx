import { Fragment, createElement } from 'react';
import type { ReactNode } from 'react';

import type {
  JsxElement,
  JsxNode,
  JsxProp,
} from '@/features/preview/application/incremental-jsx/types';

import { resolveComponent } from './component-registry';
import { PendingMark } from './pending-mark';
import { SafeNode } from './safe-node';
import { StreamLoading } from './stream-loading';
import { UnknownPlaceholder } from './unknown-placeholder';

// 生成コードが使う素の HTML 要素。未知タグはコンテナ（div）に寄せて安全側に倒す。
const HOST_TAGS = new Set([
  'div',
  'p',
  'span',
  'section',
  'header',
  'footer',
  'main',
  'article',
  'aside',
  'nav',
  'ul',
  'ol',
  'li',
  'a',
  'label',
  'form',
  'strong',
  'em',
  'small',
  'b',
  'i',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'hr',
  'br',
  'figure',
  'figcaption',
  'blockquote',
  'pre',
  'code',
]);

// key/ref は React 予約。style は生成コードでは使わせない方針（文字列 style は React が throw）。
const RESERVED = new Set(['key', 'ref', 'style']);

// 子を取らない void 要素。children を渡すと React が throw するため分けて生成する。
const VOID_TAGS = new Set(['img', 'br', 'hr', 'input']);

const resolveAttrValue = (prop: JsxProp, key: string): unknown => {
  switch (prop.value.kind) {
    case 'string':
      return prop.value.value;
    case 'literal':
      return prop.value.value;
    case 'boolean':
      return true;
    case 'element':
      return renderElement(prop.value.value, `${key}@`);
    case 'unsupported':
      return undefined;
    default:
      return undefined;
  }
};

const buildProps = (el: JsxElement, key: string): Record<string, unknown> => {
  const props: Record<string, unknown> = {};
  for (const prop of el.props) {
    if (
      prop.name === '' ||
      prop.name === '...spread' ||
      RESERVED.has(prop.name)
    ) {
      continue;
    }
    const value = resolveAttrValue(prop, key);
    if (value === undefined) {
      continue;
    }
    props[prop.name] = value;
  }
  return props;
};

const renderChildren = (
  children: readonly JsxNode[],
  key: string,
): ReactNode[] => {
  const out: ReactNode[] = [];
  for (const [i, child] of children.entries()) {
    const node = renderNode(child, `${key}.${i}`);
    if (node !== null) {
      out.push(node);
    }
  }
  return out;
};

function renderElement(el: JsxElement, key: string): ReactNode {
  const children = renderChildren(el.children, key);
  const childArg = children.length > 0 ? children : undefined;

  // フラグメント
  if (el.name === '') {
    return <Fragment key={key}>{childArg}</Fragment>;
  }

  const props = buildProps(el, key);
  const first = el.name[0] ?? '';

  // ホスト要素（小文字始まり）
  if (first === first.toLowerCase()) {
    const tag = HOST_TAGS.has(el.name) ? el.name : 'div';
    if (VOID_TAGS.has(tag)) {
      return createElement(tag, { ...props, key });
    }
    return createElement(tag, { ...props, key }, childArg);
  }

  // コンポーネント（大文字始まり）
  const Component = resolveComponent(el.name);
  if (Component === null) {
    return (
      <UnknownPlaceholder key={key} name={el.name}>
        {childArg}
      </UnknownPlaceholder>
    );
  }
  return (
    <SafeNode key={key} name={el.name}>
      <Component {...props}>{childArg}</Component>
    </SafeNode>
  );
}

function renderNode(node: JsxNode, key: string): ReactNode {
  if (node.type === 'pending') {
    return <PendingMark key={key} />;
  }
  if (node.type === 'text') {
    // 要素間の空白のみのテキストは描かない（レイアウトは gap で取る前提）。
    return node.value.trim() === '' ? null : (
      <Fragment key={key}>{node.value}</Fragment>
    );
  }
  return renderElement(node, key);
}

// トップレベルの末尾に残る `);}` のような句読点だけのテキストは描かない。
const isPunctuationText = (node: JsxNode): boolean =>
  node.type === 'text' && /^[\s);,}]*$/u.test(node.value);

export const renderRoot = (nodes: readonly JsxNode[]): ReactNode => {
  const rendered: ReactNode[] = [];
  for (const [i, node] of nodes.entries()) {
    if (isPunctuationText(node)) {
      continue;
    }
    const el = renderNode(node, String(i));
    if (el !== null) {
      rendered.push(el);
    }
  }
  // まだ何も描けない（return 未到達など）＝空っぽフェーズはスケルトンではなくスピナー。
  if (rendered.length === 0) {
    return <StreamLoading />;
  }
  return rendered;
};
