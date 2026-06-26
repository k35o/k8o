import { useQueryStates } from 'nuqs';
import { useCallback } from 'react';

import type { HtmlElementInfo } from '../../_types/html-element';
import { getElement } from '../../_utils/content-model';
import {
  DEFAULT_TAG,
  htmlNestParsers,
  htmlNestUrlKeys,
} from '../../_utils/search-params';

type NestState = {
  element: HtmlElementInfo;
  setSelected: (tag: string) => void;
};

// 選択中の要素を URL（?el=）と同期する。選択ごとに履歴を push するので、
// ブラウザの「戻る／進む」で直前に見ていた要素へ移動できる。
export const useNestState = (): NestState => {
  const [{ selected }, setState] = useQueryStates(htmlNestParsers, {
    history: 'push',
    urlKeys: htmlNestUrlKeys,
  });

  const setSelected = useCallback(
    (tag: string) => {
      void setState({ selected: tag });
    },
    [setState],
  );

  // selected はパーサで検証済みなので getElement は必ず解決する（既定値も含む）。
  const element = getElement(selected) ?? getElement(DEFAULT_TAG);
  if (element === undefined) {
    throw new Error(`要素が見つかりません: ${selected}`);
  }

  return { element, setSelected };
};
