import type { FC } from 'react';

import type { RelatedElement } from '../../_utils/content-model';
import { groupByRole } from '../../_utils/role-grouping';
import { NestChip } from '../nest-chip';

type RelatedGroupsProps = {
  items: readonly RelatedElement[];
  onSelect: (tag: string) => void;
};

const ChipList: FC<RelatedGroupsProps> = ({ items, onSelect }) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((item) => (
      <li key={item.element.tag}>
        <NestChip
          conditional={item.conditional}
          element={item.element}
          onSelect={onSelect}
          reason={item.reason}
        />
      </li>
    ))}
  </ul>
);

// 役割別に束ねて表示する。グループは常に開いた状態（開閉の混在を避ける）。
export const RelatedGroups: FC<RelatedGroupsProps> = ({ items, onSelect }) => {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3">
      {groupByRole(items).map((group) => (
        <div className="flex flex-col gap-2" key={group.role}>
          <p className="text-fg-mute text-xs font-medium">
            {group.role}（{group.items.length}）
          </p>
          <ChipList items={group.items} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
};
