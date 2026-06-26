import { CONTENT_CATEGORY_LABEL } from '../_data/categories';
import { HTML_ELEMENTS } from '../_data/elements';
import type { HtmlElementInfo } from '../_types/html-element';

const ELEMENT_BY_TAG: ReadonlyMap<string, HtmlElementInfo> = new Map(
  HTML_ELEMENTS.map((element) => [element.tag, element]),
);

export const getElement = (tag: string): HtmlElementInfo | undefined =>
  ELEMENT_BY_TAG.get(tag);

const intersects = <T>(a: readonly T[], b: readonly T[]): boolean =>
  a.some((value) => b.includes(value));

export type ContainCheck = {
  allowed: boolean;
  // 仕様上のアスタリスク（条件付き）でのみ許可される場合 true
  conditional: boolean;
  // conditional=true のときの「条件」の説明（日本語・任意）
  reason?: string;
};

const NOT_ALLOWED: ContainCheck = { allowed: false, conditional: false };
const GENERIC_REASON = '文脈や属性によって変わります（仕様を参照）';

// parent が child を直接の子として持てるか。
// 入れ子関係は「親の content model が子を許可するか」を基本に、
// 要素特有の親（child.contexts.elements）でも補完する。
export const canContain = (
  parent: HtmlElementInfo,
  child: HtmlElementInfo,
): ContainCheck => {
  const model = parent.contentModel;

  // transparent: 実際は親の content model に従う。flow/phrasing を受け入れる近似とし、
  // 文脈依存であることを示すため常に条件付き扱いにする（必須の具体子は無条件）。
  if (model.kind === 'transparent') {
    if (model.elements.includes(child.tag)) {
      return { allowed: true, conditional: false };
    }
    const childCategories = new Set([
      ...child.categories,
      ...(child.conditionalCategories ?? []),
    ]);
    const flowLike =
      childCategories.has('flow') || childCategories.has('phrasing');
    return flowLike
      ? {
          allowed: true,
          conditional: true,
          reason:
            parent.contentModel.note ??
            `${parent.tag} は透過要素。親の content model に従います`,
        }
      : NOT_ALLOWED;
  }

  // empty / none / text / foreign / varies は通常 HTML 要素の子を持てないが、
  // 子が「要素特有の親」としてこの親タグを明示している場合は許可する
  // （例: スクリプト無効時の noscript 内に置ける link / meta / style）。
  if (model.kind !== 'elements') {
    if (child.contexts.elements.includes(parent.tag)) {
      return { allowed: true, conditional: false };
    }
    if ((child.contexts.conditionalElements ?? []).includes(parent.tag)) {
      return {
        allowed: true,
        conditional: true,
        reason: parent.contentModel.note ?? GENERIC_REASON,
      };
    }
    return NOT_ALLOWED;
  }

  const childCategories = child.categories;
  const childConditionalCategories = child.conditionalCategories ?? [];

  const elementMatch = model.elements.includes(child.tag);
  const categoryMatch = intersects(model.categories, childCategories);
  const contextMatch = child.contexts.elements.includes(parent.tag);

  const conditionalElementMatch = (model.conditionalElements ?? []).includes(
    child.tag,
  );
  const conditionalCategoryMatch =
    intersects(model.conditionalCategories ?? [], childCategories) ||
    intersects(model.categories, childConditionalCategories) ||
    intersects(model.conditionalCategories ?? [], childConditionalCategories);
  const conditionalContextMatch = (
    child.contexts.conditionalElements ?? []
  ).includes(parent.tag);

  if (elementMatch || categoryMatch || contextMatch) {
    return { allowed: true, conditional: false };
  }
  if (
    conditionalElementMatch ||
    conditionalCategoryMatch ||
    conditionalContextMatch
  ) {
    // 条件の出どころが子側（子が条件付きでそのカテゴリ／この親を持つ）か
    // 親側（親が条件付きで受け入れる）かで、説明の引き元を変える。
    const childDriven =
      intersects(model.categories, childConditionalCategories) ||
      conditionalContextMatch;
    const reason = childDriven
      ? (child.conditionalNote ??
        child.contexts.note ??
        model.note ??
        GENERIC_REASON)
      : (model.note ?? child.conditionalNote ?? GENERIC_REASON);
    return { allowed: true, conditional: true, reason };
  }
  return NOT_ALLOWED;
};

// 選択要素から見た候補要素の関係種別。
export type RelationKind = 'self' | 'both' | 'parent' | 'child' | 'none';

export type Relation = {
  kind: RelationKind;
  // candidate が selected の親になれるか
  asParent: ContainCheck;
  // candidate が selected の子になれるか
  asChild: ContainCheck;
};

// 選択要素 selected を基準にした candidate の関係を判定する。
export const relationOf = (
  selected: HtmlElementInfo,
  candidate: HtmlElementInfo,
): Relation => {
  const asParent = canContain(candidate, selected);
  const asChild = canContain(selected, candidate);

  let kind: RelationKind;
  if (selected.tag === candidate.tag) {
    kind = 'self';
  } else if (asParent.allowed && asChild.allowed) {
    kind = 'both';
  } else if (asParent.allowed) {
    kind = 'parent';
  } else if (asChild.allowed) {
    kind = 'child';
  } else {
    kind = 'none';
  }
  return { kind, asParent, asChild };
};

export type RelatedElement = {
  element: HtmlElementInfo;
  conditional: boolean;
  // conditional=true のときの条件説明（任意）
  reason?: string;
};

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
  }).sort(byTag);

// selected が「中に入れられる子要素」一覧（タグ名順）。
export const getChildren = (selected: HtmlElementInfo): RelatedElement[] =>
  HTML_ELEMENTS.flatMap((candidate) => {
    if (candidate.tag === selected.tag) {
      return [];
    }
    const check = canContain(selected, candidate);
    return check.allowed ? [toRelated(candidate, check)] : [];
  }).sort(byTag);

// 自分自身を入れ子にできるか（div の中に div など）。
export const canSelfNest = (selected: HtmlElementInfo): ContainCheck =>
  canContain(selected, selected);

// その要素が「中に置けるもの」を短くまとめた日本語（不可だったときの理由表示用）。
export const describeAllowedContent = (element: HtmlElementInfo): string => {
  const cm = element.contentModel;
  if (cm.kind === 'empty') {
    return '空要素なので子を持てません';
  }
  if (cm.kind === 'none') {
    return '内容を持てません（Nothing）';
  }
  if (cm.kind === 'text') {
    return 'テキストのみ';
  }
  if (cm.kind === 'foreign') {
    return 'SVG / MathML の独自コンテンツ';
  }
  if (cm.kind === 'varies') {
    return '文脈により変化';
  }
  if (cm.kind === 'transparent') {
    return '親の content model に従う（透過）';
  }
  if (cm.elements.length > 0) {
    return cm.elements.map((tag) => `<${tag}>`).join(' / ');
  }
  if (cm.categories.length > 0) {
    return cm.categories
      .map((category) => CONTENT_CATEGORY_LABEL[category])
      .join(' / ');
  }
  return '—';
};
