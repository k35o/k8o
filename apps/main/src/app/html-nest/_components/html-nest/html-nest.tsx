'use client';

import { Anchor } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { SPEC_INDEX_URL } from '../../_utils/references';
import { ContainmentView } from '../containment-view';
import { useNestState } from './use-nest-state';

export const HtmlNest: FC = () => {
  const { element, setSelected } = useNestState();

  return (
    <div className="flex flex-col gap-4">
      <ContainmentView element={element} onSelect={setSelected} />

      <p className="text-fg-mute text-xs">
        データ出典:{' '}
        <Anchor href={SPEC_INDEX_URL} openInNewTab>
          WHATWG HTML Standard（要素インデックス）
        </Anchor>
      </p>
    </div>
  );
};
