'use client';

import { href } from '@k8ordo/framework';
import { Anchor, Button } from '@k8ordo/ui';
import type { FC } from 'react';

import notFound640 from './404.640w.avif';
import notFound960 from './404.960w.avif';
import notFoundImage from './404.avif';

import styles from './not-found.module.css';

export const NotFound: FC = () => (
  <div className={styles.root}>
    <img
      alt="404 Not Found"
      height={720}
      sizes="(width >= 82rem) 80rem, calc(100vw - 2rem)"
      src={notFoundImage}
      srcSet={`${notFound640} 640w, ${notFound960} 960w, ${notFoundImage} 1280w`}
      width={1280}
    />
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
    {/* sitemap.xml と llms.txt はファイルで、先読みするとペイロードの 404 を取りにいく */}
    <p className={styles.otherLinks}>
      <Anchor href={href('/blog')}>ブログ一覧</Anchor>・
      <Anchor data-k8ordo-prefetch={false} href="/sitemap.xml">
        サイトマップ
      </Anchor>
      ・
      <Anchor data-k8ordo-prefetch={false} href="/llms.txt">
        llms.txt
      </Anchor>
      からも探せます。
    </p>
  </div>
);
