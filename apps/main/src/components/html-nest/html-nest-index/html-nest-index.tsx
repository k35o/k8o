import { Heading } from '@k8ordo/ui';
import { ListIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import { HtmlNest } from '../html-nest/html-nest';

import styles from './html-nest-index.module.css';

// ListIcon をどのページも読むファイルに載せないよう、サーバーで描いて渡す
export const HtmlNestIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">HTMLいれ子マップ</Heading>
      <section className={styles.section}>
        <HtmlNest pickerIcon={<ListIcon size="sm" />} />
      </section>
    </div>
  </div>
);
