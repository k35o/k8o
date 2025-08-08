import { findAllColors } from '@k8o/helpers/color';
import { type FC, Fragment } from 'react';

export const Code: FC<{
  children: string;
}> = ({ children }) => {
  const colors = findAllColors(children);

  if (colors.length === 0) {
    return (
      <code className="m-0.5 rounded-md bg-bg-mute px-1.5 sm:py-0.5">
        {children}
      </code>
    );
  }

  // 各色の前にカラースウォッチを挿入してコンテンツを構築
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  colors.forEach((colorInfo, index) => {
    // 色の前のテキストを追加
    if (colorInfo.start > lastIndex) {
      parts.push(children.slice(lastIndex, colorInfo.start));
    }

    // 色のテキストの前にカラースウォッチを追加
    parts.push(
      <Fragment key={`color-${String(index)}`}>
        <span
          aria-label={`Color: ${colorInfo.color}`}
          className="inline-block h-3 w-3 flex-shrink-0 rounded-sm border border-gray-300"
          role="img"
          style={{ backgroundColor: colorInfo.color }}
        />
        {children.slice(colorInfo.start, colorInfo.end)}
      </Fragment>,
    );

    lastIndex = colorInfo.end;
  });

  // 残りのテキストを追加
  if (lastIndex < children.length) {
    parts.push(children.slice(lastIndex));
  }

  return (
    <code className="m-0.5 inline-flex items-center gap-1 rounded-md bg-bg-mute px-1.5 sm:py-0.5">
      {parts}
    </code>
  );
};
