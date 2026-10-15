import type { RelatedElement } from '@k8o/html-nest';
import type { FC } from 'react';

import { groupByRole } from '../../_utils/role-grouping';
import { NestChip } from '../nest-chip';

import styles from './related-groups.module.css';

type RelatedGroupsProps = {
  items: readonly RelatedElement[];
  onSelect: (tag: string) => void;
};

const ChipList: FC<RelatedGroupsProps> = ({ items, onSelect }) => (
  <ul className={styles.chips}>
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
    <div className={styles.root}>
      {groupByRole(items).map((group) => (
        <div className={styles.group} key={group.role}>
          <p className={styles.groupLabel}>
            {group.role}（{group.items.length}）
          </p>
          <ChipList items={group.items} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
};
