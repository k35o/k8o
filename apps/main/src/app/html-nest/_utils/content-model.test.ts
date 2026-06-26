import { CONTENT_CATEGORY_METAS } from '../_data/categories';
import { HTML_ELEMENTS, HTML_ELEMENT_TAGS } from '../_data/elements';
import type { ContentCategory, HtmlElementInfo } from '../_types/html-element';
import {
  canContain,
  canSelfNest,
  describeAllowedContent,
  getChildren,
  getElement,
  getParents,
  relationOf,
} from './content-model';

const TAG_SET = new Set(HTML_ELEMENT_TAGS);
const CATEGORY_SET = new Set<string>(
  CONTENT_CATEGORY_METAS.map((meta) => meta.key),
);

// テスト本体に条件分岐を持ち込まないため、要素取得をモジュール側に閉じ込める。
const el = (tag: string): HtmlElementInfo => {
  const found = getElement(tag);
  if (found === undefined) {
    throw new Error(`未知の要素: ${tag}`);
  }
  return found;
};

const parentTagsOf = (tag: string): string[] =>
  getParents(el(tag)).map((related) => related.element.tag);

const childTagsOf = (tag: string): string[] =>
  getChildren(el(tag)).map((related) => related.element.tag);

// 参照される子・親の要素名がデータセットに存在するかを事前計算。
const collectDanglingRefs = (): string[] => {
  const dangling: string[] = [];
  for (const element of HTML_ELEMENTS) {
    const referenced = [
      ...element.contentModel.elements,
      ...(element.contentModel.conditionalElements ?? []),
      ...element.contexts.elements,
      ...(element.contexts.conditionalElements ?? []),
    ];
    for (const tag of referenced) {
      if (!TAG_SET.has(tag)) {
        dangling.push(`${element.tag} -> ${tag}`);
      }
    }
  }
  return dangling;
};

// 使用カテゴリがすべて既知キーかを事前計算。
const collectUnknownCategories = (): string[] => {
  const unknown: string[] = [];
  for (const element of HTML_ELEMENTS) {
    const used: readonly ContentCategory[] = [
      ...element.categories,
      ...(element.conditionalCategories ?? []),
      ...element.contentModel.categories,
      ...(element.contentModel.conditionalCategories ?? []),
      ...element.contexts.categories,
    ];
    for (const category of used) {
      if (!CATEGORY_SET.has(category)) {
        unknown.push(`${element.tag}: ${category}`);
      }
    }
  }
  return unknown;
};

// 「PがCを子に持てる ⟺ CがPを親に持てる」の対称性違反を事前計算。
const collectSymmetryMismatches = (): string[] => {
  const mismatches: string[] = [];
  for (const parent of HTML_ELEMENTS) {
    const children = new Set(childTagsOf(parent.tag));
    for (const child of HTML_ELEMENTS) {
      if (parent.tag === child.tag) {
        continue;
      }
      const inChildren = children.has(child.tag);
      const inParents = parentTagsOf(child.tag).includes(parent.tag);
      if (inChildren !== inParents) {
        mismatches.push(`${parent.tag} ∋ ${child.tag}`);
      }
    }
  }
  return mismatches;
};

const DANGLING_REFS = collectDanglingRefs();
const UNKNOWN_CATEGORIES = collectUnknownCategories();
const SYMMETRY_MISMATCHES = collectSymmetryMismatches();
const VOID_NON_EMPTY = HTML_ELEMENTS.filter(
  (element) => element.void && element.contentModel.kind !== 'empty',
).map((element) => element.tag);
const ORPHANS = HTML_ELEMENTS.filter(
  (element) => element.tag !== 'html' && getParents(element).length === 0,
).map((element) => element.tag);

describe('HTML要素データセットの整合性', () => {
  describe('正常系', () => {
    it('全115要素を重複なく持つ', () => {
      expect(HTML_ELEMENTS).toHaveLength(115);
      expect(TAG_SET.size).toBe(HTML_ELEMENTS.length);
    });

    it('参照される子・親の要素名はすべてデータセットに存在する', () => {
      expect(DANGLING_REFS).toStrictEqual([]);
    });

    it('使用されるコンテンツカテゴリはすべて既知のキーである', () => {
      expect(UNKNOWN_CATEGORIES).toStrictEqual([]);
    });

    it('void要素のcontent modelはemptyである', () => {
      expect(VOID_NON_EMPTY).toStrictEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('html以外のすべての要素は少なくとも1つの親を持つ', () => {
      expect(ORPHANS).toStrictEqual([]);
    });

    it('ルート要素htmlは親を持たない', () => {
      expect(parentTagsOf('html')).toStrictEqual([]);
    });
  });
});

describe('canContain / 入れ子関係の解決', () => {
  describe('親子関係は対称である', () => {
    it('PがCを子に持てる ⟺ CがPを親に持てる', () => {
      expect(SYMMETRY_MISMATCHES).toStrictEqual([]);
    });
  });

  describe('正常系（典型的な入れ子）', () => {
    it('liはul・ol・menuの中に置けるが、div・pの中には置けない', () => {
      const parents = parentTagsOf('li');
      expect(parents).toEqual(expect.arrayContaining(['ul', 'ol', 'menu']));
      expect(parents).not.toContain('div');
      expect(parents).not.toContain('p');
    });

    it('ulはliのみを子に持ち、p・divは子にできない', () => {
      const children = childTagsOf('ul');
      expect(children).toContain('li');
      expect(children).not.toContain('p');
      expect(children).not.toContain('div');
    });

    it('trはtable系の中に置け、td/thを子に持つ', () => {
      expect(parentTagsOf('tr')).toEqual(
        expect.arrayContaining(['table', 'thead', 'tbody', 'tfoot']),
      );
      expect(childTagsOf('tr')).toEqual(expect.arrayContaining(['td', 'th']));
    });

    it('optionはselect・datalist・optgroupの中に置ける', () => {
      expect(parentTagsOf('option')).toEqual(
        expect.arrayContaining(['select', 'datalist', 'optgroup']),
      );
    });

    it('pはspanなどフレージングを子に持つが、divは子にできない', () => {
      const children = childTagsOf('p');
      expect(children).toEqual(expect.arrayContaining(['span', 'a', 'strong']));
      expect(children).not.toContain('div');
    });

    it('bodyの親はhtmlだけである', () => {
      expect(parentTagsOf('body')).toStrictEqual(['html']);
    });
  });

  describe('エッジケース（特殊なcontent model）', () => {
    it('void要素imgは子要素を持てない', () => {
      expect(childTagsOf('img')).toStrictEqual([]);
    });

    it('text専用のtitleは子要素を持たず、親はheadである', () => {
      expect(childTagsOf('title')).toStrictEqual([]);
      expect(parentTagsOf('title')).toStrictEqual(['head']);
    });

    it('transparentなaはflow相当を条件付きで子に持てる', () => {
      const check = canContain(el('a'), el('div'));
      expect(check.allowed).toBe(true);
      expect(check.conditional).toBe(true);
    });

    it('divはdivを入れ子にできる（自己入れ子）', () => {
      expect(canSelfNest(el('div')).allowed).toBe(true);
    });
  });

  describe('relationOf', () => {
    it('同じ要素同士の関係はselfになる', () => {
      expect(relationOf(el('div'), el('div')).kind).toBe('self');
    });

    it('divとsectionは互いに親にも子にもなれる（both）', () => {
      expect(relationOf(el('div'), el('section')).kind).toBe('both');
    });

    it('optionから見たselectはparent、selectから見たoptionはchild', () => {
      expect(relationOf(el('option'), el('select')).kind).toBe('parent');
      expect(relationOf(el('select'), el('option')).kind).toBe('child');
    });

    it('liとulは入れ子リストのため互いに親にも子にもなれる（both）', () => {
      expect(relationOf(el('li'), el('ul')).kind).toBe('both');
    });
  });
});

describe('describeAllowedContent / 許可内容の要約', () => {
  it('具体要素で許可する要素はタグ一覧を返す', () => {
    expect(describeAllowedContent(el('ul'))).toContain('<li>');
  });

  it('カテゴリで許可する要素はカテゴリ名を返す', () => {
    expect(describeAllowedContent(el('div'))).toBe('Flow content');
  });

  it('空要素は子を持てない旨を返す', () => {
    expect(describeAllowedContent(el('img'))).toBe(
      '空要素なので子を持てません',
    );
  });

  it('テキストのみの要素はテキストのみと返す', () => {
    expect(describeAllowedContent(el('title'))).toBe('テキストのみ');
  });
});
