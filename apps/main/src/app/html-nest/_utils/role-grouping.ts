import { BOARD_GROUPS } from '../_data/board-groups';
import type { RelatedElement } from './content-model';

const ROLE_OF = new Map<string, string>();
for (const group of BOARD_GROUPS) {
  for (const tag of group.tags) {
    ROLE_OF.set(tag, group.label);
  }
}

const ROLE_ORDER: readonly string[] = BOARD_GROUPS.map((group) => group.label);
const OTHER_ROLE = 'その他';

export type RoleGroup = {
  role: string;
  items: RelatedElement[];
};

// 関連要素リストを役割（BOARD_GROUPS のラベル）で束ねる。BOARD_GROUPS の順を保つ。
export const groupByRole = (items: readonly RelatedElement[]): RoleGroup[] => {
  const buckets = new Map<string, RelatedElement[]>();
  for (const item of items) {
    const role = ROLE_OF.get(item.element.tag) ?? OTHER_ROLE;
    const arr = buckets.get(role) ?? [];
    arr.push(item);
    buckets.set(role, arr);
  }
  return [...ROLE_ORDER, OTHER_ROLE].flatMap((role) => {
    const arr = buckets.get(role);
    return arr && arr.length > 0 ? [{ role, items: arr }] : [];
  });
};
