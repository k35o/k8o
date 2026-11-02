import type { HtmlElementInfo } from '@k8o/html-nest';
import { Tooltip } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './nest-chip.module.css';

type NestChipProps = {
  element: HtmlElementInfo;
  // spec 上の条件付きでのみ成立する関係か
  conditional: boolean;
  // 条件付きのときの条件説明（ツールチップ表示用）。無ければ undefined。
  reason: string | undefined;
  onSelect: (tag: string) => void;
};

export const NestChip: FC<NestChipProps> = ({
  element,
  conditional,
  reason,
  onSelect,
}) => {
  const label = `${element.tag}${conditional ? '（条件つき）' : ''}。クリックでこの要素を見る`;
  const onClick = (): void => {
    onSelect(element.tag);
  };
  const inner = (
    <>
      <span className={styles.tag}>{`<${element.tag}>`}</span>
      {conditional && <span className={styles.mark}>*</span>}
    </>
  );

  // 条件付きで理由があるときだけ、ツールチップ付きのボタンにする。
  if (conditional && reason !== undefined) {
    return (
      <Tooltip.Root placement="top">
        <Tooltip.Trigger
          renderItem={(props) => (
            <button
              {...props}
              aria-label={label}
              className={styles.root}
              data-conditional={conditional}
              onClick={onClick}
              type="button"
            >
              {inner}
            </button>
          )}
        />
        <Tooltip.Content>
          <p className={styles.reason}>条件: {reason}</p>
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  return (
    <button
      aria-label={label}
      className={styles.root}
      data-conditional={conditional}
      onClick={onClick}
      type="button"
    >
      {inner}
    </button>
  );
};
