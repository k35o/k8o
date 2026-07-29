import { HTML_ELEMENTS as BASE_HTML_ELEMENTS } from '@k8o/html-nest';
import type { HtmlElementInfo } from '@k8o/html-nest';
import { HTML_ELEMENT_DESCRIPTIONS } from '@k8o/html-nest/descriptions';

import { HTML_ELEMENTS } from './elements';

// 日本語（非ASCII文字）を含むかどうかで翻訳済みかを判定する。
// パッケージ側の英語文言はすべてASCIIのみで構成される。
const hasJapanese = (text: string): boolean => /\P{ASCII}/u.test(text);

const UNTRANSLATED_DESCRIPTIONS = HTML_ELEMENTS.filter(
  (element) =>
    element.description === undefined || !hasJapanese(element.description),
).map((element) => element.tag);

// パッケージの英語文言（descriptions エントリ）と日本語訳のずれを事前計算。
const collectNoteIssues = (): string[] => {
  const issues: string[] = [];
  for (const localized of HTML_ELEMENTS) {
    const en = HTML_ELEMENT_DESCRIPTIONS[localized.tag];
    if (en === undefined) {
      issues.push(`${localized.tag}: 英語の descriptions に存在しない`);
      continue;
    }
    const pairs: ReadonlyArray<
      [string, string | undefined, string | undefined]
    > = [
      ['contentModel.note', en.contentModelNote, localized.contentModel.note],
      ['contexts.note', en.contextsNote, localized.contexts.note],
      ['conditionalNote', en.conditionalNote, localized.conditionalNote],
    ];
    for (const [field, enNote, jaNote] of pairs) {
      if (enNote === undefined) {
        if (jaNote !== undefined) {
          issues.push(
            `${localized.tag}: ${field} は英語側に無いのに追加されている`,
          );
        }
        continue;
      }
      if (jaNote === undefined || !hasJapanese(jaNote)) {
        issues.push(`${localized.tag}: ${field} が未翻訳`);
      }
    }
  }
  return issues;
};

// 表示文言（description / note）以外は判定に影響するため、
// パッケージのデータと完全に一致しなければならない。
const logicalPart = (element: HtmlElementInfo): HtmlElementInfo => ({
  ...element,
  description: '',
  conditionalNote: '',
  contentModel: { ...element.contentModel, note: '' },
  contexts: { ...element.contexts, note: '' },
});

describe('要素データの日本語化', () => {
  it('全要素のdescriptionが日本語化されている', () => {
    expect(UNTRANSLATED_DESCRIPTIONS).toStrictEqual([]);
  });

  it('noteの有無がパッケージの英語文言と一致し、すべて日本語化されている', () => {
    expect(collectNoteIssues()).toStrictEqual([]);
  });

  it('表示文言以外のフィールドはパッケージと一致する', () => {
    expect(HTML_ELEMENTS.map((element) => logicalPart(element))).toStrictEqual(
      BASE_HTML_ELEMENTS.map((element) => logicalPart(element)),
    );
  });
});
