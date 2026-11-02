'use client';

import { Anchor } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';

import { ContainmentView } from '../containment-view/containment-view';
import { SPEC_INDEX_URL } from '../references/references';
import { useNestState } from './use-nest-state';

import styles from './html-nest.module.css';

type Props = {
  pickerIcon: ReactNode;
};

const Content: FC<Props> = ({ pickerIcon }) => {
  const { element, setSelected } = useNestState();

  return (
    <div className={styles.root}>
      <ContainmentView
        element={element}
        onSelect={setSelected}
        pickerIcon={pickerIcon}
      />

      <p className={styles.source}>
        データ出典:{' '}
        <Anchor href={SPEC_INDEX_URL} openInNewTab>
          WHATWG HTML Standard（要素インデックス）
        </Anchor>
      </p>
    </div>
  );
};

// static mode の HTML は URL の state を既定値で描くので、HTML に描くと URL の値で開いたときに既定の要素が
// 一度出る。Next と同じく本文はブラウザでだけ描く
export const HtmlNest: FC<Props> = (props) => (
  <BrowserOnly>
    <Content {...props} />
  </BrowserOnly>
);
