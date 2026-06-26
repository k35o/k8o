import { BOARD_GROUPS } from './board-groups';
import { HTML_ELEMENT_TAGS } from './elements';

const ALL_BOARD_TAGS = BOARD_GROUPS.flatMap((group) => group.tags);
const DATASET_TAGS = new Set(HTML_ELEMENT_TAGS);
const BOARD_TAG_SET = new Set(ALL_BOARD_TAGS);

const DUPLICATES = ALL_BOARD_TAGS.filter(
  (tag, index) => ALL_BOARD_TAGS.indexOf(tag) !== index,
);
const UNKNOWN = ALL_BOARD_TAGS.filter((tag) => !DATASET_TAGS.has(tag));
const MISSING = HTML_ELEMENT_TAGS.filter((tag) => !BOARD_TAG_SET.has(tag));

describe('ボードの役割別グループ', () => {
  it('全要素を重複なく1グループずつに割り当てている', () => {
    expect(ALL_BOARD_TAGS).toHaveLength(HTML_ELEMENT_TAGS.length);
  });

  it('重複して割り当てられた要素がない', () => {
    expect(DUPLICATES).toStrictEqual([]);
  });

  it('データセットに存在しないタグを含まない', () => {
    expect(UNKNOWN).toStrictEqual([]);
  });

  it('どのグループにも入っていない要素がない', () => {
    expect(MISSING).toStrictEqual([]);
  });
});
