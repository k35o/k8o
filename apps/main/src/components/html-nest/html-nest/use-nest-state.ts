import type { HtmlElementInfo } from '@k8o/html-nest';
import { useAppState } from '@k8ordo/state';
import { useCallback } from 'react';

import { getElement } from '../content-model/content-model';
import { htmlNestState, readNestUrl } from '../search-params/search-params';

type NestState = {
  element: HtmlElementInfo;
  setSelected: (tag: string) => void;
};

// 選択中の要素を URL（?el=）と同期する。選択ごとに履歴を push するので、
// ブラウザの「戻る／進む」で直前に見ていた要素へ移動できる。
export const useNestState = (): NestState => {
  const [url, update] = useAppState(htmlNestState);

  const setSelected = useCallback(
    (tag: string) => {
      update({ el: tag }, { history: 'push' });
    },
    [update],
  );

  const tag = readNestUrl(url);
  // tag は表にあるタグか既定値なので、getElement は必ず解決する。
  const element = getElement(tag);
  if (element === undefined) {
    throw new Error(`要素が見つかりません: ${tag}`);
  }

  return { element, setSelected };
};
