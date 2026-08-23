import {
  CONTENT_CATEGORY_LABEL,
  canContain as canContainBase,
  canSelfNest as canSelfNestBase,
} from '@k8o/html-nest';
import type {
  ContainCheck,
  ContentModelKind,
  HtmlElementInfo,
  RelatedElement,
} from '@k8o/html-nest';

import { HTML_ELEMENTS } from '../_data/elements';

// 入れ子判定は @k8o/html-nest に委ねる。パッケージ側の getElement /
// getParents / getChildren は英語の要素データを走査するため、
// 日本語化済みの HTML_ELEMENTS を対象にここで引き当て直す。
const ELEMENT_BY_TAG: ReadonlyMap<string, HtmlElementInfo> = new Map(
  HTML_ELEMENTS.map((element) => [element.tag, element]),
);

export const getElement = (tag: string): HtmlElementInfo | undefined =>
  ELEMENT_BY_TAG.get(tag);

// note 由来の reason は _data/elements.ts で日本語化済みなので、
// パッケージ組み込みの既定文言（reasonKind が note 以外）だけをここで差し替える。
const GENERIC_REASON_JA = '文脈や属性によって変わります（仕様を参照）';

const localizeCheck = (
  check: ContainCheck,
  parent: HtmlElementInfo,
): ContainCheck => {
  if (check.reasonKind === 'generic') {
    return { ...check, reason: GENERIC_REASON_JA };
  }
  if (check.reasonKind === 'transparent') {
    return {
      ...check,
      reason: `${parent.tag} は透過要素。親の content model に従います`,
    };
  }
  return check;
};

// parent が child を直接の子として持てるか。
export const canContain = (
  parent: HtmlElementInfo,
  child: HtmlElementInfo,
): ContainCheck => localizeCheck(canContainBase(parent, child), parent);

// 自分自身を入れ子にできるか（div の中に div など）。
export const canSelfNest = (selected: HtmlElementInfo): ContainCheck =>
  localizeCheck(canSelfNestBase(selected), selected);

const byTag = (a: RelatedElement, b: RelatedElement): number =>
  a.element.tag.localeCompare(b.element.tag);

// exactOptionalPropertyTypes 下で reason を条件付きで載せる。
const toRelated = (
  element: HtmlElementInfo,
  check: ContainCheck,
): RelatedElement =>
  check.reason === undefined
    ? { element, conditional: check.conditional }
    : { element, conditional: check.conditional, reason: check.reason };

// selected を「中に入れられる親要素」一覧（タグ名順）。
export const getParents = (selected: HtmlElementInfo): RelatedElement[] =>
  HTML_ELEMENTS.flatMap((candidate) => {
    if (candidate.tag === selected.tag) {
      return [];
    }
    const check = canContain(candidate, selected);
    return check.allowed ? [toRelated(candidate, check)] : [];
  }).toSorted(byTag);

// selected が「中に入れられる子要素」一覧（タグ名順）。
export const getChildren = (selected: HtmlElementInfo): RelatedElement[] =>
  HTML_ELEMENTS.flatMap((candidate) => {
    if (candidate.tag === selected.tag) {
      return [];
    }
    const check = canContain(selected, candidate);
    return check.allowed ? [toRelated(candidate, check)] : [];
  }).toSorted(byTag);

// elements（通常）以外の content model 種別の要約文。
const KIND_SUMMARY: Record<Exclude<ContentModelKind, 'elements'>, string> = {
  empty: '空要素なので子を持てません',
  none: '内容を持てません（Nothing）',
  text: 'テキストのみ',
  foreign: 'SVG / MathML の独自コンテンツ',
  varies: '文脈により変化',
  transparent: '親の content model に従う（透過）',
};

// その要素が「中に置けるもの」を短くまとめた日本語（不可だったときの理由表示用）。
// パッケージの describeAllowedContent の日本語版フォークで、構成は本家に合わせて
// あり、本家の要約に変更が入ったらここへも反映する。
export const describeAllowedContent = (element: HtmlElementInfo): string => {
  const cm = element.contentModel;
  // 条件付きで置ける内容は仕様のアスタリスクに合わせて * を付けて併記する
  // （colgroup のように条件付きしか持たない要素で一覧が空にならないようにする）。
  const conditionalParts = [
    ...(cm.conditionalElements ?? []).map((tag) => `<${tag}>*`),
    ...(cm.conditionalCategories ?? []).map(
      (category) => `${CONTENT_CATEGORY_LABEL[category]}*`,
    ),
  ];
  if (cm.kind !== 'elements') {
    const summary = KIND_SUMMARY[cm.kind];
    return conditionalParts.length > 0
      ? `${summary}（条件付き: ${conditionalParts.join(' / ')}）`
      : summary;
  }
  // 具体要素とカテゴリの両方を受け入れる要素（details / fieldset / figure など）は、
  // 片方だけだと「置けるのは: <summary>」のように flow content が欠落するため併記する。
  const parts = [
    ...cm.elements.map((tag) => `<${tag}>`),
    ...cm.categories.map((category) => CONTENT_CATEGORY_LABEL[category]),
    ...conditionalParts,
  ];
  return parts.length > 0 ? parts.join(' / ') : '—';
};
