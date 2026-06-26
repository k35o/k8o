import { Tooltip } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import type { HtmlElementInfo } from '../../_types/html-element';

type NestChipProps = {
  element: HtmlElementInfo;
  // spec 上の条件付きでのみ成立する関係か
  conditional: boolean;
  // 条件付きのときの条件説明（ツールチップ表示用）。無ければ undefined。
  reason: string | undefined;
  onSelect: (tag: string) => void;
};

const chipClass = (conditional: boolean): string =>
  cn(
    'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-colors duration-150 ease-out',
    'focus-visible:ring-primary-border outline-none focus-visible:ring-2',
    'bg-bg-base hover:bg-bg-mute',
    conditional ? 'border-border-warning border-dashed' : 'border-border-mute',
  );

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
      <span className="text-fg-base font-mono text-sm">{`<${element.tag}>`}</span>
      {conditional && (
        <span className="text-fg-warning text-xs font-bold">*</span>
      )}
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
              className={chipClass(conditional)}
              onClick={onClick}
              type="button"
            >
              {inner}
            </button>
          )}
        />
        <Tooltip.Content>
          <p className="max-w-xs text-sm leading-relaxed">条件: {reason}</p>
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  return (
    <button
      aria-label={label}
      className={chipClass(conditional)}
      onClick={onClick}
      type="button"
    >
      {inner}
    </button>
  );
};
