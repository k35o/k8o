import { AlertIcon, CheckIcon } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { RelatedElement } from '../../_utils/content-model';
import { RelatedGroups } from '../related-groups';

type RelationResultsProps = {
  items: readonly RelatedElement[];
  // 「そのまま置ける（OK）」「そのまま囲める（OK）」など方向に応じた見出し
  okLabel: string;
  onSelect: (tag: string) => void;
};

// 関連要素を「OK（無条件）」と「条件付き」に分けて見せる共通表示。
// どちらも空なら null（呼び出し側で「該当なし」を出す）。
export const RelationResults: FC<RelationResultsProps> = ({
  items,
  okLabel,
  onSelect,
}) => {
  const okItems = items.filter((related) => !related.conditional);
  const condItems = items.filter((related) => related.conditional);

  if (okItems.length === 0 && condItems.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {okItems.length > 0 && (
        <div>
          <p className="text-fg-success mb-2 flex items-center gap-1.5 text-xs font-medium">
            <CheckIcon size="sm" />
            {okLabel}（{okItems.length}）
          </p>
          <RelatedGroups items={okItems} onSelect={onSelect} />
        </div>
      )}
      {condItems.length > 0 && (
        <div>
          <p className="text-fg-warning mb-2 flex items-center gap-1.5 text-xs font-medium">
            <AlertIcon size="sm" status="warning" />
            条件付き（{condItems.length}）
          </p>
          <RelatedGroups items={condItems} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
};
