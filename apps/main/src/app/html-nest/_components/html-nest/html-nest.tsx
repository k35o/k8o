'use client';

import { Anchor } from '@k8ordo/ui';
import type { FC } from 'react';

import { SPEC_INDEX_URL } from '../../_utils/references';
import { ContainmentView } from '../containment-view';
import { useNestState } from './use-nest-state';

import styles from './html-nest.module.css';

export const HtmlNest: FC = () => {
  const { element, setSelected } = useNestState();

  return (
    <div className={styles.root}>
      <ContainmentView element={element} onSelect={setSelected} />

      <p className={styles.source}>
        データ出典:{' '}
        <Anchor href={SPEC_INDEX_URL} openInNewTab>
          WHATWG HTML Standard（要素インデックス）
        </Anchor>
      </p>
    </div>
  );
};
