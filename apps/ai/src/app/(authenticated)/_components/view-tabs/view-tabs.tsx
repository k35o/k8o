import { Button } from '@k8o/arte-odyssey';
import type { ReactNode } from 'react';

type ViewTabsProps<T extends string> = {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

// ビュー切替のセグメントボタン列。ボタンだけを並べ、
// 表示制御（レスポンシブの出し分け・余白）は呼び出し側のラッパーが持つ。
export const ViewTabs = <T extends string>({
  options,
  value,
  onChange,
}: ViewTabsProps<T>): ReactNode =>
  options.map((option) => (
    <Button
      color="primary"
      key={option.value}
      onClick={() => {
        onChange(option.value);
      }}
      size="sm"
      variant={option.value === value ? 'solid' : 'skeleton'}
    >
      {option.label}
    </Button>
  ));
