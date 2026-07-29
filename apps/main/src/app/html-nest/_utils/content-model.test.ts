import type { HtmlElementInfo } from '@k8o/html-nest';

import { HTML_ELEMENTS } from '../_data/elements';
import {
  canContain,
  describeAllowedContent,
  getChildren,
  getElement,
  getParents,
} from './content-model';

// 入れ子判定そのものは @k8o/html-nest 側のテストが守るため、
// ここでは日本語化レイヤー（reason と要約文言）だけを検証する。

// テスト本体に条件分岐を持ち込まないため、要素取得をモジュール側に閉じ込める。
const el = (tag: string): HtmlElementInfo => {
  const found = getElement(tag);
  if (found === undefined) {
    throw new Error(`未知の要素: ${tag}`);
  }
  return found;
};

// 全要素の親子一覧に英語（非日本語）の reason が残っていないかを事前計算。
// 文言のハードコードに依存しないため、パッケージが既定文言を変えても検出できる。
const collectUntranslatedReasons = (): string[] =>
  HTML_ELEMENTS.flatMap((element) =>
    [...getParents(element), ...getChildren(element)].flatMap((related) =>
      related.reason === undefined ? [] : [related.reason],
    ),
  ).filter((reason) => !/\P{ASCII}/u.test(reason));

const UNTRANSLATED_REASONS = collectUntranslatedReasons();

describe('canContain / reason の日本語化', () => {
  it('親側の note 由来の reason は日本語化した note が返る', () => {
    const check = canContain(el('a'), el('div'));
    expect(check.conditional).toBe(true);
    expect(check.reason).toContain('親のcontent modelに従う');
  });

  it('子側の conditionalNote 由来の reason も日本語で返る', () => {
    const check = canContain(el('div'), el('main'));
    expect(check.conditional).toBe(true);
    expect(check.reason).toContain('階層的に正しい');
  });

  it('note を持たない条件付き関係は汎用文言も日本語になる', () => {
    const check = canContain(el('div'), el('optgroup'));
    expect(check.conditional).toBe(true);
    expect(check.reason).toBe('文脈や属性によって変わります（仕様を参照）');
  });

  it('関連要素一覧の reason はすべて日本語になっている', () => {
    expect(UNTRANSLATED_REASONS).toStrictEqual([]);
  });
});

describe('describeAllowedContent / 許可内容の要約', () => {
  it('具体要素で許可する要素はタグ一覧を返す', () => {
    expect(describeAllowedContent(el('ul'))).toContain('<li>');
  });

  it('カテゴリで許可する要素はカテゴリ名を返す', () => {
    expect(describeAllowedContent(el('div'))).toBe('Flow content');
  });

  it('具体要素とカテゴリの両方を持つ要素は両方を併記する', () => {
    // details: elements ['summary'] かつ categories ['flow']
    const result = describeAllowedContent(el('details'));
    expect(result).toContain('<summary>');
    expect(result).toContain('Flow content');
  });

  it('空要素は子を持てない旨を返す', () => {
    expect(describeAllowedContent(el('img'))).toBe(
      '空要素なので子を持てません',
    );
  });

  it('テキストのみの要素はテキストのみと返す', () => {
    expect(describeAllowedContent(el('title'))).toBe('テキストのみ');
  });

  it('条件付きの内容はアスタリスク付きで併記し、一覧を空にしない', () => {
    expect(describeAllowedContent(el('colgroup'))).toBe('<col>* / <template>*');
    expect(describeAllowedContent(el('select'))).toContain('<button>*');
    expect(describeAllowedContent(el('option'))).toBe(
      'テキストのみ（条件付き: <div>* / Phrasing content*）',
    );
  });
});
