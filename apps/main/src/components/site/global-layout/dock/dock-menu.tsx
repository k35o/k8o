'use client';

import { Popover } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import styles from './dock.module.css';

/** ドックの項目のうち、押すと上にパネルが開くもの */
export const DockMenu: FC<{
  icon: ReactNode;
  label: string;
  /** ドックがこの項目だけを残しているあいだ、`label` に替えて出す字 */
  pinnedLabel?: string;
  isCurrent?: boolean;
  isOpen?: boolean;
  onChange?: (isOpen: boolean) => void;
  children: ReactNode;
}> = ({
  icon,
  label,
  pinnedLabel = label,
  isCurrent = false,
  isOpen,
  onChange,
  children,
}) => (
  <Popover.Root
    placement="top-end"
    role="dialog"
    {...(isOpen === undefined ? {} : { isOpen })}
    {...(onChange === undefined ? {} : { onChange })}
  >
    <Popover.Trigger
      renderItem={(props) => (
        <button
          {...props}
          className={styles.item}
          data-current={isCurrent}
          type="button"
        >
          {icon}
          <span className={styles.label}>{label}</span>
          <span className={styles.pinnedLabel}>{pinnedLabel}</span>
        </button>
      )}
    />
    <Popover.Content
      renderItem={(props) => (
        <div {...props} aria-label={label} className={styles.panel}>
          {children}
        </div>
      )}
    />
  </Popover.Root>
);
