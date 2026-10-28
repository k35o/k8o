'use client';

import { href } from '@k8ordo/framework';
import { Anchor, Button } from '@k8ordo/ui';
import type { FC } from 'react';

import notFoundImage from './404.avif';

import styles from './not-found.module.css';

export const NotFound: FC = () => (
  <div className={styles.root}>
    <img alt="404 Not Found" height={720} src={notFoundImage} width={1280} />
    <Button
      renderItem={({
        children,
        disabled: _disabled,
        type: _type,
        ...props
      }) => (
        <a href={href('/')} {...props}>
          {children}
        </a>
      )}
      size="lg"
    >
      トップへ戻る
    </Button>
    <p className={styles.otherLinks}>
      <Anchor href={href('/blog')}>ブログ一覧</Anchor>・
      <Anchor href="/sitemap.xml">サイトマップ</Anchor>・
      <Anchor href="/llms.txt">llms.txt</Anchor>
      からも探せます。
    </p>
  </div>
);
